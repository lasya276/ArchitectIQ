"""
Blueprints API Router Module.
Provides endpoints for generating, retrieving, listing versions, and updating project architecture blueprints.
All endpoints are scoped under /projects/{project_id}/blueprint and enforce multi-tenant ownership.
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud.crud_project import crud_project
from app.crud.crud_blueprint import crud_blueprint
from app.models.user import User
from app.schemas.blueprint import (
    BlueprintResponse,
    BlueprintGenerateRequest,
    BlueprintUpdateRequest,
    BlueprintVersionItem,
)
from app.services.architecture_generator import get_architecture_generator

router = APIRouter()


def _get_owned_project(db: Session, project_id: UUID, user_id: UUID):
    """Helper: fetch project and enforce ownership. Raises 404 on failure."""
    project = crud_project.get_by_id_and_owner(db, project_id=project_id, user_id=user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied."
        )
    return project


@router.post(
    "/{project_id}/blueprint/generate",
    response_model=BlueprintResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_blueprint(
    project_id: UUID,
    request_in: Optional[BlueprintGenerateRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate a new architecture blueprint version based on the current project workspace specifications.
    Creates a new version (v1, v2, etc.) and preserves all existing historical versions.
    """
    project = _get_owned_project(db, project_id=project_id, user_id=current_user.id)

    # Invoke the grounded architecture generator engine
    generator = get_architecture_generator()
    sections = generator.generate_blueprint(
        project=project,
        workspace=project.workspace,
        questionnaire=project.questionnaire,
    )

    # Persist as a new blueprint version
    blueprint = crud_blueprint.create_version(
        db=db,
        project_id=project_id,
        sections=sections,
        status="completed",
    )
    return blueprint


@router.get("/{project_id}/blueprint", response_model=BlueprintResponse)
def get_blueprint(
    project_id: UUID,
    version: Optional[int] = Query(None, description="Specific blueprint version to fetch"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve an architecture blueprint for a project.
    Fetches the latest version if version query parameter is omitted.
    Returns 404 if no blueprint has been generated yet.
    """
    _get_owned_project(db, project_id=project_id, user_id=current_user.id)

    if version is not None:
        blueprint = crud_blueprint.get_by_project_and_version(db, project_id=project_id, version=version)
    else:
        blueprint = crud_blueprint.get_latest_by_project_id(db, project_id=project_id)

    if not blueprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No architecture blueprint found for this project."
        )
    return blueprint


@router.get("/{project_id}/blueprint/versions", response_model=List[BlueprintVersionItem])
def list_blueprint_versions(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all available architecture blueprint versions for a project.
    """
    _get_owned_project(db, project_id=project_id, user_id=current_user.id)
    versions = crud_blueprint.get_versions_by_project_id(db, project_id=project_id)
    return [
        BlueprintVersionItem(
            version=v.version,
            status=v.status,
            created_at=v.created_at,
        )
        for v in versions
    ]


@router.put("/{project_id}/blueprint", response_model=BlueprintResponse)
def update_blueprint(
    project_id: UUID,
    blueprint_in: BlueprintUpdateRequest,
    version: Optional[int] = Query(None, description="Specific blueprint version to update"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Save manual refinements or section edits to an existing architecture blueprint version.
    """
    _get_owned_project(db, project_id=project_id, user_id=current_user.id)

    if version is not None:
        blueprint = crud_blueprint.get_by_project_and_version(db, project_id=project_id, version=version)
    else:
        blueprint = crud_blueprint.get_latest_by_project_id(db, project_id=project_id)

    if not blueprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No architecture blueprint found to update."
        )

    updated = crud_blueprint.update_sections(db, db_obj=blueprint, sections_in=blueprint_in.sections)
    return updated
