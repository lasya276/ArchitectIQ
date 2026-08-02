"""
Project Questionnaire ORM Model Module.
Stores the structured requirement discovery wizard answers for a project.
Designed to be versioning-ready for future AI phases.
"""
import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class ProjectQuestionnaire(Base):
    """
    SQLAlchemy ORM Model for Project Questionnaires table.
    Stores all wizard answers as a flexible JSONB payload
    associated 1:1 with a Project.
    """
    __tablename__ = "project_questionnaires"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )

    # Flexible JSONB payload — all wizard answers stored here
    answers = Column(JSONB, nullable=False, default=dict)

    # Wizard completion status
    status = Column(String(50), nullable=False, default="draft")  # draft | completed

    # Versioning field for future phased evolution
    version = Column(Integer, nullable=False, default=1)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # 1:1 Relationship back to Project
    project = relationship("Project", back_populates="questionnaire")

    def __repr__(self) -> str:
        return f"<ProjectQuestionnaire id={self.id} project_id={self.project_id} status={self.status}>"
