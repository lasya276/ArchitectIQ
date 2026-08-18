"""
Project ORM Model Module.
Defines database structure, fields, indexes, and relationships for user projects.
"""
import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Project(Base):
    """
    SQLAlchemy ORM Model for Projects table.
    """
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="projects")
    workspace = relationship("ProjectWorkspace", back_populates="project", uselist=False, cascade="all, delete-orphan")
    questionnaire = relationship("ProjectQuestionnaire", back_populates="project", uselist=False, cascade="all, delete-orphan")
    blueprints = relationship("ProjectBlueprint", back_populates="project", cascade="all, delete-orphan", order_by="desc(ProjectBlueprint.version)")

    def __repr__(self) -> str:
        return f"<Project id={self.id} title={self.title} user_id={self.user_id}>"

