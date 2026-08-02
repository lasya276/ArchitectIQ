"""
Pydantic Schemas for Project Workspace Data Validation & Serialization.
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class WorkspaceBase(BaseModel):
    """Shared Workspace properties for 8 editable sections."""
    vision: Optional[str] = ""
    problem_statement: Optional[str] = ""
    requirements: Optional[str] = ""
    constraints: Optional[str] = ""
    business_goals: Optional[str] = ""
    stakeholders: Optional[str] = ""
    target_users: Optional[str] = ""

class WorkspaceCreate(WorkspaceBase):
    """Schema for Workspace Creation."""
    pass

class WorkspaceUpdate(WorkspaceBase):
    """Schema for Workspace Updates."""
    pass

class WorkspaceResponse(WorkspaceBase):
    """Schema for Workspace Response."""
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
