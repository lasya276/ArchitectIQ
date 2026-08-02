"""
CRUD Operations Module for Projects.
"""
from typing import Optional, List, Union, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.crud.crud_workspace import crud_workspace

class CRUDProject:
    """CRUD operations for Project model."""

    def get_by_id(self, db: Session, project_id: UUID) -> Optional[Project]:
        """Fetch project by ID with workspace eager loaded."""
        return db.query(Project).options(joinedload(Project.workspace)).filter(Project.id == project_id).first()

    def get_by_id_and_owner(self, db: Session, project_id: UUID, user_id: UUID) -> Optional[Project]:
        """Fetch project by ID ensuring ownership by user_id."""
        return (
            db.query(Project)
            .options(joinedload(Project.workspace))
            .filter(Project.id == project_id, Project.user_id == user_id)
            .first()
        )

    def get_multi_by_owner(
        self, db: Session, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        """Fetch all projects owned by user_id ordered by updated_at descending."""
        return (
            db.query(Project)
            .filter(Project.user_id == user_id)
            .order_by(Project.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_with_owner(self, db: Session, obj_in: ProjectCreate, user_id: UUID) -> Project:
        """Create a new project owned by user_id and initialize its blank workspace."""
        db_obj = Project(
            title=obj_in.title.strip(),
            description=obj_in.description.strip() if obj_in.description else None,
            status=obj_in.status if obj_in.status else "draft",
            user_id=user_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        # Automatically initialize 1:1 ProjectWorkspace entry
        crud_workspace.create_for_project(db, project_id=db_obj.id)
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Project, obj_in: Union[ProjectUpdate, Dict[str, Any]]) -> Project:
        """Update existing project metadata and workspace content if included."""
        if isinstance(obj_in, dict):
            update_data = obj_in
            workspace_data = update_data.pop("workspace", None)
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            workspace_data = update_data.pop("workspace", None)

        for field in update_data:
            if hasattr(db_obj, field) and update_data[field] is not None:
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        db.commit()

        # Update nested workspace if workspace_data is provided
        if workspace_data:
            if db_obj.workspace:
                crud_workspace.update(db, db_obj=db_obj.workspace, obj_in=workspace_data)
            else:
                ws = crud_workspace.create_for_project(db, project_id=db_obj.id)
                crud_workspace.update(db, db_obj=ws, obj_in=workspace_data)

        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, project_id: UUID, user_id: UUID) -> Optional[Project]:
        """Delete project if owned by user_id."""
        db_obj = self.get_by_id_and_owner(db, project_id=project_id, user_id=user_id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj

crud_project = CRUDProject()
