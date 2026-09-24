"""
Project Software Design ORM Model Module.
Stores structured software designs and version history for projects.
Each software design version is linked to a specific Architecture Blueprint version.
"""
import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class ProjectSoftwareDesign(Base):
    """
    SQLAlchemy ORM Model for Project Software Designs table.
    Stores complete 8-section software design as JSONB.
    Supports multi-version history per project, with each version
    tracking which Architecture Blueprint version it was derived from.
    """
    __tablename__ = "project_software_designs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Which Architecture Blueprint version this software design was derived from
    blueprint_version = Column(Integer, nullable=False)

    # Independent software design version: 1, 2, 3...
    version = Column(Integer, nullable=False, default=1)

    # Status: completed | generating | failed
    status = Column(String(50), nullable=False, default="completed")

    # Structured 8-section software design data
    sections = Column(JSONB, nullable=False, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship back to Project
    project = relationship("Project", back_populates="software_designs")

    def __repr__(self) -> str:
        return (
            f"<ProjectSoftwareDesign id={self.id} project_id={self.project_id} "
            f"version=v{self.version} blueprint_version=v{self.blueprint_version} status={self.status}>"
        )
