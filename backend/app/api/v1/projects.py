"""
Projects & Workspaces API Router Module.
Provides CRUD endpoints for Project Management and Workspace Content editing with strict ownership isolation.
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.crud.crud_project import crud_project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListItem

router = APIRouter()

@router.get("", response_model=List[ProjectListItem])
def list_user_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all projects owned by the currently authenticated user.
    """
    projects = crud_project.get_multi_by_owner(db, user_id=current_user.id, skip=skip, limit=limit)
    return projects

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new project owned by current user. Automatically initializes blank workspace content.
    """
    project = crud_project.create_with_owner(db, obj_in=project_in, user_id=current_user.id)
    return project

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project_by_id(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve detailed project and embedded workspace content by ID.
    Enforces multi-tenant ownership check.
    """
    project = crud_project.get_by_id_and_owner(db, project_id=project_id, user_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied."
        )
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project_by_id(
    project_id: UUID,
    project_in: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update project details and/or editable workspace sections (Vision, Requirements, etc.).
    Enforces multi-tenant ownership check.
    """
    project = crud_project.get_by_id_and_owner(db, project_id=project_id, user_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied."
        )

    updated_project = crud_project.update(db, db_obj=project, obj_in=project_in)
    return updated_project

@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project_by_id(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete project and cascading workspace data by ID.
    Enforces multi-tenant ownership check.
    """
    deleted_project = crud_project.remove(db, project_id=project_id, user_id=current_user.id)
    if not deleted_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied."
        )
    return {"message": "Project deleted successfully"}
