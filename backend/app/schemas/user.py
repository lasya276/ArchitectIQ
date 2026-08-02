"""
Pydantic Schemas for User Data Validation & Serialization.
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserBase(BaseModel):
    """Shared User properties."""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255, description="Full Name of the user")

class UserCreate(UserBase):
    """Schema for User Registration."""
    password: str = Field(..., min_length=8, max_length=128, description="User password (min 8 characters)")

class UserLogin(BaseModel):
    """Schema for User Login."""
    email: EmailStr
    password: str = Field(..., min_length=1)

class UserUpdate(BaseModel):
    """Schema for User Profile Update."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    password: Optional[str] = Field(None, min_length=8, max_length=128)

class UserResponse(UserBase):
    """Schema for User Public Response (excluding password hash)."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserAuthResponse(BaseModel):
    """Schema for Auth Response returning User and Access Token info."""
    user: UserResponse
    message: str = "Authentication successful"
