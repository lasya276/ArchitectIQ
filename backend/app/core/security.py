"""
Security & Cryptographic Helper Utilities.
Implements password hashing (bcrypt) and JWT token generation/verification.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Initialize Passlib CryptContext with Bcrypt hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a stored bcrypt hash.
    
    :param plain_password: Raw password string provided by user.
    :param hashed_password: Stored bcrypt hash from database.
    :return: True if password matches hash, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a plain text password using Bcrypt.
    
    :param password: Raw password string.
    :return: Secure Bcrypt hashed string.
    """
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generate a signed JWT Access Token for user authentication.
    
    :param subject: User ID or identifier subject.
    :param expires_delta: Custom expiration duration. Defaults to settings.ACCESS_TOKEN_EXPIRE_MINUTES.
    :return: Encoded JWT string token.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.now(timezone.utc)
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT access token.
    
    :param token: JWT string token.
    :return: Payload dictionary if token is valid, None if expired or invalid.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
