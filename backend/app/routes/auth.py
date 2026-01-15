from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, field_validator
from sqlmodel import Session, select, delete

from app.db import get_session
from app.models.user import User
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    is_admin_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterIn(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_max_72_bytes(cls, v: str):
        if len(v.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar 72 bytes (bcrypt).")
        return v


class LoginIn(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=201)
def register(payload: RegisterIn, session: Session = Depends(get_session)):
    email = payload.email.strip().lower()

    exists = session.exec(select(User).where(User.email == email)).first()
    if exists:
        # (opcional) si ya existe y es el admin email, lo promovemos
        if is_admin_email(email) and not exists.is_admin:
            exists.is_admin = True
            session.add(exists)
            session.commit()
            session.refresh(exists)
            return {"id": exists.id, "email": exists.email, "is_admin": exists.is_admin}

        raise HTTPException(status_code=409, detail="Email already registered")

    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password too short (min 6)")

    try:
        hashed = hash_password(payload.password)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # ✅ CLAVE: si el email coincide con ADMIN_EMAIL -> se crea admin
    user = User(email=email, hashed_password=hashed, is_admin=is_admin_email(email))

    session.add(user)
    session.commit()
    session.refresh(user)

    return {"id": user.id, "email": user.email, "is_admin": user.is_admin}


@router.post("/login")
def login(payload: LoginIn, session: Session = Depends(get_session)):
    email = payload.email.strip().lower()

    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(sub=user.email)
    return {"access_token": token, "token_type": "bearer", "is_admin": user.is_admin}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "is_admin": user.is_admin}


@router.delete("/me", status_code=204)
def delete_me(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    session.exec(delete(User).where(User.id == user.id))
    session.commit()
    return