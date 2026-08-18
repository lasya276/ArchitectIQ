"""
Project Blueprint ORM Model Module.
Stores structured architecture blueprints and version history for projects.
"""
import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class ProjectBlueprint(Base):
    """
    SQLAlchemy ORM Model for Project Blueprints table.
    Stores complete 11-section architecture blueprint as JSONB.
    Supports multi-version history per project.
    """
    __tablename__ = "project_blueprints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Version integer: 1, 2, 3...
    version = Column(Integer, nullable=False, default=1)

    # Status: completed | draft | generating
    status = Column(String(50), nullable=False, default="completed")

    # Structured 11-section architecture blueprint data
    sections = Column(JSONB, nullable=False, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship back to Project
    project = relationship("Project", back_populates="blueprints")

    def __repr__(self) -> str:
        return f"<ProjectBlueprint id={self.id} project_id={self.project_id} version=v{self.version} status={self.status}>"
