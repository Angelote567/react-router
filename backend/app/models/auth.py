from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlmodel import Session, select

from app.db import get_session
from app.models.user import User

# CONFIG 
SECRET_KEY = "CHANGE_ME_SUPER_SECRET"  # replace with a long/random secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

# Password hashing configuration (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme to extract Bearer token from Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    # Hash a plain password
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    # Verify a plain password against its hash
    return pwd_context.verify(password, password_hash)


def create_access_token(sub: str, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    # Create a JWT access token
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    payload = {"sub": sub, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    # Retrieve the currently authenticated user from the JWT
    cred_exc = HTTPException(status_code=401, detail="Invalid or missing token")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: Optional[str] = payload.get("sub")
        if not email:
            raise cred_exc
    except JWTError:
        raise cred_exc

    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise cred_exc
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    # Restrict access to admin users only
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return user
