from typing import Annotated
from fastapi import Depends
from sqlmodel import Session
from app.db import get_session

# Dependency alias to inject a database session into route handlers
SessionDep = Annotated[Session, Depends(get_session)]
