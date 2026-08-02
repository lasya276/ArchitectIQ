"""
CRUD Operations Module for Project Workspaces.
"""
from typing import Optional, Union, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.workspace import ProjectWorkspace
from app.schemas.workspace import WorkspaceUpdate

class CRUDWorkspace:
    """CRUD operations for ProjectWorkspace model."""

    def get_by_project_id(self, db: Session, project_id: UUID) -> Optional[ProjectWorkspace]:
        """Fetch workspace by project ID."""
        return db.query(ProjectWorkspace).filter(ProjectWorkspace.project_id == project_id).first()

    def create_for_project(self, db: Session, project_id: UUID) -> ProjectWorkspace:
        """Create initial blank workspace for a project."""
        db_obj = ProjectWorkspace(
            project_id=project_id,
            vision="",
            problem_statement="",
            requirements="",
            constraints="",
            business_goals="",
            stakeholders="",
            target_users=""
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: ProjectWorkspace, obj_in: Union[WorkspaceUpdate, Dict[str, Any]]) -> ProjectWorkspace:
        """Update workspace fields."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field in update_data:
            if hasattr(db_obj, field) and update_data[field] is not None:
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

crud_workspace = CRUDWorkspace()
