"""
Pydantic Schemas for Project Architecture Blueprint Data Validation & Serialization.
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class OverviewSection(BaseModel):
    summary: str = Field(..., description="High-level architecture overview")
    domain: str = Field(..., description="Industry or functional domain")
    primary_focus: str = Field(..., description="Primary architectural emphasis")
    scope: str = Field(..., description="Boundary and scale of system")


class ArchitectureStyleSection(BaseModel):
    style_name: str = Field(..., description="Primary architectural style")
    pattern_type: str = Field(..., description="Design patterns employed")
    justification: str = Field(..., description="Grounding rationale for selected style")


class TechStackSection(BaseModel):
    frontend: List[str] = Field(default_factory=list)
    backend: List[str] = Field(default_factory=list)
    database: List[str] = Field(default_factory=list)
    devops_infrastructure: List[str] = Field(default_factory=list)
    third_party_services: List[str] = Field(default_factory=list)


class ComponentItem(BaseModel):
    name: str
    type: str
    responsibility: str
    interfaces: List[str] = Field(default_factory=list)


class RelationshipItem(BaseModel):
    source: str
    target: str
    interaction: str
    protocol: str


class DataArchitectureSection(BaseModel):
    storage_strategy: str
    data_stores: List[str] = Field(default_factory=list)
    data_flow: str


class IntegrationItem(BaseModel):
    name: str
    purpose: str
    protocol: str


class SecurityQualitySection(BaseModel):
    security_controls: List[str] = Field(default_factory=list)
    quality_attributes: List[str] = Field(default_factory=list)
    compliance: List[str] = Field(default_factory=list)


class DecisionItem(BaseModel):
    decision: str
    rationale: str
    grounded_requirement: str
    alternatives_considered: List[str] = Field(default_factory=list)


class RiskItem(BaseModel):
    risk: str
    impact: str
    mitigation: str
    tradeoff: str


class VisualDiagramSection(BaseModel):
    diagram_type: str
    mermaid_code: str
    description: str


class BlueprintSections(BaseModel):
    overview: OverviewSection
    architecture_style: ArchitectureStyleSection
    tech_stack: TechStackSection
    components: List[ComponentItem] = Field(default_factory=list)
    component_relationships: List[RelationshipItem] = Field(default_factory=list)
    data_architecture: DataArchitectureSection
    integrations: List[IntegrationItem] = Field(default_factory=list)
    security_and_quality: SecurityQualitySection
    decisions_and_rationale: List[DecisionItem] = Field(default_factory=list)
    risks_and_tradeoffs: List[RiskItem] = Field(default_factory=list)
    visual_diagram: VisualDiagramSection


class BlueprintGenerateRequest(BaseModel):
    """Schema for triggering blueprint generation."""
    increment_version: Optional[bool] = True


class BlueprintUpdateRequest(BaseModel):
    """Schema for saving manual modifications to blueprint sections."""
    sections: Dict[str, Any]


class BlueprintVersionItem(BaseModel):
    """Schema for version history metadata item."""
    version: int
    status: str
    created_at: datetime


class BlueprintResponse(BaseModel):
    """Schema for Blueprint API Response."""
    id: UUID
    project_id: UUID
    version: int
    status: str
    sections: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
