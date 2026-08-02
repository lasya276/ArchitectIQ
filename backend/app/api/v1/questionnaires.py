"""
Questionnaires API Router Module.
Provides endpoints for creating, retrieving, and updating project questionnaire answers.
All endpoints are scoped under /projects/{project_id}/questionnaire and enforce ownership.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.crud.crud_project import crud_project
from app.crud.crud_questionnaire import crud_questionnaire
from app.models.user import User
from app.schemas.questionnaire import QuestionnaireCreate, QuestionnaireUpdate, QuestionnaireResponse

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


@router.get("/{project_id}/questionnaire", response_model=QuestionnaireResponse)
def get_questionnaire(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve the questionnaire answers for a project.
    Returns 404 if no questionnaire has been saved yet.
    """
    _get_owned_project(db, project_id=project_id, user_id=current_user.id)

    questionnaire = crud_questionnaire.get_by_project_id(db, project_id=project_id)
    if not questionnaire:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questionnaire found for this project."
        )
    return questionnaire


@router.post("/{project_id}/questionnaire", response_model=QuestionnaireResponse, status_code=status.HTTP_201_CREATED)
def create_questionnaire(
    project_id: UUID,
    questionnaire_in: QuestionnaireCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new questionnaire for a project.
    Returns 409 if a questionnaire already exists (use PUT to update).
    """
    _get_owned_project(db, project_id=project_id, user_id=current_user.id)

    existing = crud_questionnaire.get_by_project_id(db, project_id=project_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A questionnaire already exists for this project. Use PUT to update."
        )

    return crud_questionnaire.create_for_project(db, project_id=project_id, obj_in=questionnaire_in)


@router.put("/{project_id}/questionnaire", response_model=QuestionnaireResponse)
def update_questionnaire(
    project_id: UUID,
    questionnaire_in: QuestionnaireUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update existing questionnaire answers and/or status.
    Creates one if it does not exist yet (upsert behaviour).
    """
    _get_owned_project(db, project_id=project_id, user_id=current_user.id)
    return crud_questionnaire.upsert(db, project_id=project_id, obj_in=questionnaire_in)
