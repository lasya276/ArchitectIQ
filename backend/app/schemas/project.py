"""
Pydantic Schemas for Project Data Validation & Serialization.
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.workspace import WorkspaceResponse, WorkspaceUpdate

class ProjectBase(BaseModel):
    """Shared Project properties."""
    title: str = Field(..., min_length=1, max_length=255, description="Project title")
    description: Optional[str] = Field(None, description="Project summary description")
    status: str = Field("draft", description="Project status: draft, in_progress, completed, archived")

class ProjectCreate(BaseModel):
    """Schema for creating a Project."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = "draft"

class ProjectUpdate(BaseModel):
    """Schema for updating a Project and optionally its nested Workspace."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    workspace: Optional[WorkspaceUpdate] = None

class ProjectResponse(ProjectBase):
    """Schema for Project Detail Response."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    workspace: Optional[WorkspaceResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ProjectListItem(ProjectBase):
    """Schema for Project List Card Response."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
