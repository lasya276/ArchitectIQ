"""
Project Workspace ORM Model Module.
Defines database structure for editable project content sections.
"""
import uuid
from sqlalchemy import Column, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class ProjectWorkspace(Base):
    """
    SQLAlchemy ORM Model for Project Workspaces table.
    """
    __tablename__ = "project_workspaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # 8 Editable Workspace Sections
    vision = Column(Text, nullable=True, default="")
    problem_statement = Column(Text, nullable=True, default="")
    requirements = Column(Text, nullable=True, default="")
    constraints = Column(Text, nullable=True, default="")
    business_goals = Column(Text, nullable=True, default="")
    stakeholders = Column(Text, nullable=True, default="")
    target_users = Column(Text, nullable=True, default="")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # 1:1 Relationship back to Project
    project = relationship("Project", back_populates="workspace")

    def __repr__(self) -> str:
        return f"<ProjectWorkspace id={self.id} project_id={self.project_id}>"
