"""
Software Designs API Router Module.
Provides endpoints for generating, retrieving, and listing versions of project software designs.
All endpoints are scoped under /projects/{project_id}/software-design and enforce multi-tenant ownership.

Software Design generation is explicitly tied to a specific Architecture Blueprint version
(provided by the client as blueprint_version in the request body). The backend never silently
resolves to a different blueprint version.
"""
import logging
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud.crud_project import crud_project
from app.crud.crud_blueprint import crud_blueprint
from app.crud.crud_software_design import crud_software_design
from app.models.user import User
from app.schemas.software_design import (
    SoftwareDesignResponse,
    SoftwareDesignGenerateRequest,
    SoftwareDesignVersionItem,
)
from app.services.software_design_generator import SoftwareDesignGenerator

logger = logging.getLogger(__name__)

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
    "/{project_id}/software-design/generate",
    response_model=SoftwareDesignResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_software_design(
    project_id: UUID,
    request_in: SoftwareDesignGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate a new software design version from a specific Architecture Blueprint version.

    The client must supply the exact blueprint_version the user was viewing when initiating
    generation. The backend fetches that specific blueprint and uses it as the source of truth.
    A new software design version is always created (v1, v2, v3...), preserving history.
    """
    project = _get_owned_project(db, project_id=project_id, user_id=current_user.id)

    # Fetch the SPECIFIC Architecture Blueprint version requested — never default to latest
    blueprint = crud_blueprint.get_by_project_and_version(
        db, project_id=project_id, version=request_in.blueprint_version
    )
    if not blueprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Architecture Blueprint v{request_in.blueprint_version} not found for this project. "
                "Please ensure a blueprint has been generated before requesting a software design."
            )
        )

    # Invoke AI Software Design Generator
    try:
        generator = SoftwareDesignGenerator()
        sections = generator.generate_design(
            project=project,
            workspace=project.workspace,
            questionnaire=project.questionnaire,
            blueprint_sections=blueprint.sections,
            blueprint_version=request_in.blueprint_version,
        )
    except RuntimeError as e:
        # Configuration error (missing API key, etc.)
        logger.error(f"Software design configuration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Software design generation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Software design generation failed due to an AI service error. "
                "Please try again. If the problem persists, contact support."
            )
        )

    # Persist as a new software design version
    design = crud_software_design.create_version(
        db=db,
        project_id=project_id,
        blueprint_version=request_in.blueprint_version,
        sections=sections,
        status="completed",
    )
    return design


@router.get("/{project_id}/software-design", response_model=SoftwareDesignResponse)
def get_software_design(
    project_id: UUID,
    version: Optional[int] = Query(None, description="Specific software design version to fetch"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve a software design for a project.
    Fetches the latest version if version query parameter is omitted.
    Returns 404 if no software design has been generated yet.
    """
    _get_owned_project(db, project_id=project_id, user_id=current_user.id)

    if version is not None:
        design = crud_software_design.get_by_project_and_version(
            db, project_id=project_id, version=version
        )
    else:
        design = crud_software_design.get_latest_by_project_id(db, project_id=project_id)

    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No software design found for this project."
        )
    return design


@router.get(
    "/{project_id}/software-design/versions",
    response_model=List[SoftwareDesignVersionItem],
)
def list_software_design_versions(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all available software design versions for a project.
    Each version item includes the blueprint_version it was derived from.
    """
    _get_owned_project(db, project_id=project_id, user_id=current_user.id)
    versions = crud_software_design.get_versions_by_project_id(db, project_id=project_id)
    return [
        SoftwareDesignVersionItem(
            version=v.version,
            blueprint_version=v.blueprint_version,
            status=v.status,
            created_at=v.created_at,
        )
        for v in versions
    ]
