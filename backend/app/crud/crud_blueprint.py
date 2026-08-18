"""
CRUD Operations Module for Project Architecture Blueprints.
"""
from typing import Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.blueprint import ProjectBlueprint


class CRUDBlueprint:
    """CRUD operations for ProjectBlueprint model."""

    def get_latest_by_project_id(self, db: Session, project_id: UUID) -> Optional[ProjectBlueprint]:
        """Fetch the most recent blueprint version for a project."""
        return (
            db.query(ProjectBlueprint)
            .filter(ProjectBlueprint.project_id == project_id)
            .order_by(ProjectBlueprint.version.desc())
            .first()
        )

    def get_by_project_and_version(
        self, db: Session, project_id: UUID, version: int
    ) -> Optional[ProjectBlueprint]:
        """Fetch a specific blueprint version for a project."""
        return (
            db.query(ProjectBlueprint)
            .filter(ProjectBlueprint.project_id == project_id, ProjectBlueprint.version == version)
            .first()
        )

    def get_versions_by_project_id(self, db: Session, project_id: UUID) -> List[ProjectBlueprint]:
        """Fetch all blueprint versions for a project ordered by version descending."""
        return (
            db.query(ProjectBlueprint)
            .filter(ProjectBlueprint.project_id == project_id)
            .order_by(ProjectBlueprint.version.desc())
            .all()
        )

    def get_max_version(self, db: Session, project_id: UUID) -> int:
        """Get the highest version number for a project."""
        max_ver = (
            db.query(func.max(ProjectBlueprint.version))
            .filter(ProjectBlueprint.project_id == project_id)
            .scalar()
        )
        return max_ver or 0

    def create_version(
        self,
        db: Session,
        project_id: UUID,
        sections: Dict[str, Any],
        status: str = "completed"
    ) -> ProjectBlueprint:
        """Create a new blueprint version (version = max_version + 1). Older versions are never overwritten."""
        current_max = self.get_max_version(db, project_id=project_id)
        new_version = current_max + 1

        db_obj = ProjectBlueprint(
            project_id=project_id,
            version=new_version,
            status=status,
            sections=sections,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_sections(
        self, db: Session, db_obj: ProjectBlueprint, sections_in: Dict[str, Any]
    ) -> ProjectBlueprint:
        """Update sections of an existing blueprint record (e.g. for manual refinements)."""
        db_obj.sections = sections_in
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


crud_blueprint = CRUDBlueprint()
