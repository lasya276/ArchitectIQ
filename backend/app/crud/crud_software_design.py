"""
CRUD Operations Module for Project Software Designs.
Mirrors the CRUDBlueprint pattern with added blueprint_version tracking.
"""
from typing import Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.software_design import ProjectSoftwareDesign


class CRUDSoftwareDesign:
    """CRUD operations for ProjectSoftwareDesign model."""

    def get_latest_by_project_id(self, db: Session, project_id: UUID) -> Optional[ProjectSoftwareDesign]:
        """Fetch the most recent software design version for a project."""
        return (
            db.query(ProjectSoftwareDesign)
            .filter(ProjectSoftwareDesign.project_id == project_id)
            .order_by(ProjectSoftwareDesign.version.desc())
            .first()
        )

    def get_by_project_and_version(
        self, db: Session, project_id: UUID, version: int
    ) -> Optional[ProjectSoftwareDesign]:
        """Fetch a specific software design version for a project."""
        return (
            db.query(ProjectSoftwareDesign)
            .filter(
                ProjectSoftwareDesign.project_id == project_id,
                ProjectSoftwareDesign.version == version,
            )
            .first()
        )

    def get_versions_by_project_id(self, db: Session, project_id: UUID) -> List[ProjectSoftwareDesign]:
        """Fetch all software design versions for a project ordered by version descending."""
        return (
            db.query(ProjectSoftwareDesign)
            .filter(ProjectSoftwareDesign.project_id == project_id)
            .order_by(ProjectSoftwareDesign.version.desc())
            .all()
        )

    def get_max_version(self, db: Session, project_id: UUID) -> int:
        """Get the highest software design version number for a project."""
        max_ver = (
            db.query(func.max(ProjectSoftwareDesign.version))
            .filter(ProjectSoftwareDesign.project_id == project_id)
            .scalar()
        )
        return max_ver or 0

    def create_version(
        self,
        db: Session,
        project_id: UUID,
        blueprint_version: int,
        sections: Dict[str, Any],
        status: str = "completed",
    ) -> ProjectSoftwareDesign:
        """
        Create a new software design version (version = max_version + 1).
        Records the specific Architecture Blueprint version this design was derived from.
        Older versions are never overwritten.
        """
        current_max = self.get_max_version(db, project_id=project_id)
        new_version = current_max + 1

        db_obj = ProjectSoftwareDesign(
            project_id=project_id,
            blueprint_version=blueprint_version,
            version=new_version,
            status=status,
            sections=sections,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


crud_software_design = CRUDSoftwareDesign()
