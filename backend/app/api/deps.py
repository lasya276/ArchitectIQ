"""
FastAPI Dependency Injection Utilities.
Provides database session dependency and HTTP-Only cookie / Header JWT authentication dependencies.
"""
from typing import Generator, Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.config import settings
from app.core.security import decode_access_token
from app.crud.crud_user import crud_user
from app.models.user import User

def get_db() -> Generator[Session, None, None]:
    """
    Dependency generator for PostgreSQL database sessions.
    Automatically closes session after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def extract_token_from_request(request: Request) -> Optional[str]:
    """
    Extract JWT access token from HTTP-Only cookie or Authorization header.
    
    Prioritizes HTTP-Only Cookie ('access_token'). Fallback to 'Authorization: Bearer <token>'.
    """
    # 1. Primary: Extract from HTTP-Only cookie
    token = request.cookies.get(settings.COOKIE_NAME)
    if token:
        if token.startswith("Bearer "):
            return token[7:].strip()
        return token.strip()

    # 2. Fallback: Extract from Authorization Header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()

    return None

def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency enforcing valid user authentication.
    Extracts and verifies JWT token from HTTP-only cookie or Authorization header.
    
    :return: Authenticated User ORM model object.
    :raises HTTPException 401: If token is missing, invalid, expired, or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = extract_token_from_request(request)
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user_id_str: Optional[str] = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    user = crud_user.get(db, user_id=user_id)
    if not user:
        raise credentials_exception

    return user
