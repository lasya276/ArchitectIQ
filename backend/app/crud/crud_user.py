"""
CRUD Operations Module for Users.
"""
from typing import Optional, Union, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password

class CRUDUser:
    """CRUD operations for User model."""

    def get(self, db: Session, user_id: UUID) -> Optional[User]:
        """Fetch user by primary key ID."""
        return db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """Fetch user by email address."""
        return db.query(User).filter(User.email == email.lower()).first()

    def create(self, db: Session, obj_in: UserCreate) -> User:
        """Create a new user record with hashed password."""
        db_obj = User(
            name=obj_in.name.strip(),
            email=obj_in.email.lower().strip(),
            password_hash=get_password_hash(obj_in.password),
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user credentials by verifying password hash."""
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def update(self, db: Session, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]) -> User:
        """Update existing user record."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        if "password" in update_data and update_data["password"]:
            update_data["password_hash"] = get_password_hash(update_data.pop("password"))
            
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

crud_user = CRUDUser()
