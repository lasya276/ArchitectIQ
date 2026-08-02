"""
Users API Router Module.
Provides user account management and current session validation endpoints.
"""
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve profile details of the currently authenticated user session.
    """
    return current_user
