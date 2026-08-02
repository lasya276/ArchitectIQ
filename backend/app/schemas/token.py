"""
Pydantic Schemas for Authentication Tokens.
"""
from typing import Optional
from pydantic import BaseModel, ConfigDict

class Token(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    """JWT Token Payload schema."""
    sub: Optional[str] = None
    exp: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)
