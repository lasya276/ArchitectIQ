"""
Pydantic Schemas for Project Questionnaire Data Validation & Serialization.
Stores structured wizard answers as a flexible dict payload.
"""
from typing import Optional, Any, Dict
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class QuestionnaireCreate(BaseModel):
    """Schema for creating a new questionnaire record."""
    answers: Dict[str, Any] = {}
    status: Optional[str] = "draft"


class QuestionnaireUpdate(BaseModel):
    """Schema for updating an existing questionnaire record."""
    answers: Optional[Dict[str, Any]] = None
    status: Optional[str] = None


class QuestionnaireResponse(BaseModel):
    """Schema for Questionnaire API Response."""
    id: UUID
    project_id: UUID
    answers: Dict[str, Any]
    status: str
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
