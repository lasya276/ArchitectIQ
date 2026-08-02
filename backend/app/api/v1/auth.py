"""
Authentication API Router Module.
Provides endpoints for User Registration, Login (issuing HTTP-Only Cookie), and Logout.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.crud.crud_user import crud_user
from app.schemas.user import UserCreate, UserLogin, UserResponse, UserAuthResponse

router = APIRouter()

def set_auth_cookie(response: Response, access_token: str) -> None:
    """Helper utility to attach HTTP-Only Secure Cookie to Response."""
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=access_token,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        domain=settings.COOKIE_DOMAIN,
        path="/"
    )

@router.post("/register", response_model=UserAuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Register a new user account.
    Checks email uniqueness, creates user record, and attaches HTTP-Only authentication cookie.
    """
    existing_user = crud_user.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = crud_user.create(db, obj_in=user_in)
    access_token = create_access_token(subject=user.id)
    set_auth_cookie(response, access_token)

    return UserAuthResponse(
        user=UserResponse.model_validate(user),
        message="Registration successful"
    )

@router.post("/login", response_model=UserAuthResponse)
def login(
    credentials: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with email and password.
    Issues JWT access token stored in an HTTP-Only secure cookie.
    """
    user = crud_user.authenticate(db, email=credentials.email, password=credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(subject=user.id)
    set_auth_cookie(response, access_token)

    return UserAuthResponse(
        user=UserResponse.model_validate(user),
        message="Login successful"
    )

@router.post("/logout")
def logout(response: Response):
    """
    Log out current user by clearing HTTP-Only authentication cookie.
    """
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        domain=settings.COOKIE_DOMAIN,
        path="/"
    )
    return {"message": "Successfully logged out"}
