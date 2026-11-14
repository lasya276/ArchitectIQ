"""
Document Export API Router Module.
Provides authenticated endpoints for exporting Architecture Blueprints,
Software Designs, and Complete Architecture Documentation in Word (.docx) and PDF (.pdf).
"""
import logging
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud.crud_project import crud_project
from app.crud.crud_blueprint import crud_blueprint
from app.crud.crud_software_design import crud_software_design
from app.models.user import User
from app.schemas.export import (
    BlueprintExportRequest,
    SoftwareDesignExportRequest,
    DocumentationExportRequest,
)
from app.services.document_exporter import (
    docx_exporter,
    pdf_exporter,
    sanitize_filename,
)

logger = logging.getLogger(__name__)

router = APIRouter()

MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
MIME_PDF = "application/pdf"


def _get_owned_project(db: Session, project_id: UUID, user_id: UUID):
    """Helper: fetch project and enforce ownership. Raises 404 on failure."""
    project = crud_project.get_by_id_and_owner(db, project_id=project_id, user_id=user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied."
        )
    return project


@router.post("/{project_id}/export/blueprint")
def export_blueprint(
    project_id: UUID,
    request_in: BlueprintExportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Export a specific version of an Architecture Blueprint as Word (.docx) or PDF (.pdf).
    """
    project = _get_owned_project(db, project_id=project_id, user_id=current_user.id)

    blueprint = crud_blueprint.get_by_project_and_version(
        db, project_id=project_id, version=request_in.blueprint_version
    )
    if not blueprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Architecture Blueprint version {request_in.blueprint_version} not found for this project."
        )

    ext = request_in.format.lower()
    filename = sanitize_filename(project.title, "blueprint", bp_ver=blueprint.version, ext=ext)

    try:
        if ext == "docx":
            buf = docx_exporter.generate_blueprint_docx(project, blueprint)
            media_type = MIME_DOCX
        else:
            buf = pdf_exporter.generate_blueprint_pdf(project, blueprint)
            media_type = MIME_PDF

        content = buf.getvalue()
        return Response(
            content=content,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            },
        )
    except Exception as e:
        logger.error(f"Blueprint export failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export Architecture Blueprint: {str(e)}"
        )


@router.post("/{project_id}/export/software-design")
def export_software_design(
    project_id: UUID,
    request_in: SoftwareDesignExportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Export a specific version of a Software Design as Word (.docx) or PDF (.pdf).
    """
    project = _get_owned_project(db, project_id=project_id, user_id=current_user.id)

    software_design = crud_software_design.get_by_project_and_version(
        db, project_id=project_id, version=request_in.software_design_version
    )
    if not software_design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Software Design version {request_in.software_design_version} not found for this project."
        )

    ext = request_in.format.lower()
    filename = sanitize_filename(project.title, "software_design", sd_ver=software_design.version, ext=ext)

    try:
        if ext == "docx":
            buf = docx_exporter.generate_software_design_docx(project, software_design)
            media_type = MIME_DOCX
        else:
            buf = pdf_exporter.generate_software_design_pdf(project, software_design)
            media_type = MIME_PDF

        content = buf.getvalue()
        return Response(
            content=content,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            },
        )
    except Exception as e:
        logger.error(f"Software design export failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export Software Design: {str(e)}"
        )


@router.post("/{project_id}/export/documentation")
def export_documentation(
    project_id: UUID,
    request_in: DocumentationExportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Export Complete Architecture Documentation (Part I: Blueprint, Part II: Software Design)
    as Word (.docx) or PDF (.pdf).
    """
    project = _get_owned_project(db, project_id=project_id, user_id=current_user.id)

    blueprint = crud_blueprint.get_by_project_and_version(
        db, project_id=project_id, version=request_in.blueprint_version
    )
    if not blueprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Architecture Blueprint version {request_in.blueprint_version} not found for this project."
        )

    software_design = crud_software_design.get_by_project_and_version(
        db, project_id=project_id, version=request_in.software_design_version
    )
    if not software_design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Software Design version {request_in.software_design_version} not found for this project."
        )

    ext = request_in.format.lower()
    filename = sanitize_filename(
        project.title, "documentation", bp_ver=blueprint.version, sd_ver=software_design.version, ext=ext
    )

    try:
        if ext == "docx":
            buf = docx_exporter.generate_documentation_docx(project, blueprint, software_design)
            media_type = MIME_DOCX
        else:
            buf = pdf_exporter.generate_documentation_pdf(project, blueprint, software_design)
            media_type = MIME_PDF

        content = buf.getvalue()
        return Response(
            content=content,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            },
        )
    except Exception as e:
        logger.error(f"Complete documentation export failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export Complete Documentation: {str(e)}"
        )
