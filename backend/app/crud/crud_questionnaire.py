"""
CRUD Operations Module for Project Questionnaires.
"""
from typing import Optional, Union, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.questionnaire import ProjectQuestionnaire
from app.schemas.questionnaire import QuestionnaireCreate, QuestionnaireUpdate


class CRUDQuestionnaire:
    """CRUD operations for ProjectQuestionnaire model."""

    def get_by_project_id(self, db: Session, project_id: UUID) -> Optional[ProjectQuestionnaire]:
        """Fetch questionnaire by project ID."""
        return (
            db.query(ProjectQuestionnaire)
            .filter(ProjectQuestionnaire.project_id == project_id)
            .first()
        )

    def create_for_project(
        self, db: Session, project_id: UUID, obj_in: QuestionnaireCreate
    ) -> ProjectQuestionnaire:
        """Create a new questionnaire record for a project."""
        db_obj = ProjectQuestionnaire(
            project_id=project_id,
            answers=obj_in.answers,
            status=obj_in.status or "draft",
            version=1,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        db_obj: ProjectQuestionnaire,
        obj_in: Union[QuestionnaireUpdate, Dict[str, Any]],
    ) -> ProjectQuestionnaire:
        """Update questionnaire answers and/or status."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if hasattr(db_obj, field) and value is not None:
                setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def upsert(
        self,
        db: Session,
        project_id: UUID,
        obj_in: Union[QuestionnaireCreate, QuestionnaireUpdate, Dict[str, Any]],
    ) -> ProjectQuestionnaire:
        """Create or update questionnaire for a project."""
        existing = self.get_by_project_id(db, project_id=project_id)
        if existing:
            return self.update(db, db_obj=existing, obj_in=obj_in)
        if isinstance(obj_in, QuestionnaireCreate):
            return self.create_for_project(db, project_id=project_id, obj_in=obj_in)
        # Coerce to create if dict or update schema
        data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
        create_in = QuestionnaireCreate(
            answers=data.get("answers", {}),
            status=data.get("status", "draft"),
        )
        return self.create_for_project(db, project_id=project_id, obj_in=create_in)


crud_questionnaire = CRUDQuestionnaire()
