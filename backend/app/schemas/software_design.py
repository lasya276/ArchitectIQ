"""
Pydantic Schemas for Project Software Design Data Validation & Serialization.
Defines the structured 8-section software design output schema used by both
the AI generator (Gemini structured output) and the API response layer.
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, model_validator


# ─── Section 1: Overview ────────────────────────────────────────────────────

class DesignOverview(BaseModel):
    design_approach: str = Field(..., description="Overall design philosophy and strategy")
    application_type: str = Field(..., description="Type and runtime profile of the application")
    architectural_style_alignment: str = Field(..., description="How software design maps to the architecture blueprint")
    core_modules: List[str] = Field(default_factory=list, description="Top-level software modules or packages")
    primary_technologies: List[str] = Field(default_factory=list, description="Primary runtime technologies")
    database_approach: str = Field(..., description="Approach to data persistence and storage")
    key_design_considerations: List[str] = Field(default_factory=list, description="Critical design constraints and trade-offs")


# ─── Section 2: High-Level Design ───────────────────────────────────────────

class HLDComponent(BaseModel):
    name: str = Field(..., description="Component or module name")
    layer: str = Field(..., description="Architectural layer (e.g., Presentation, Business Logic, Data)")
    responsibility: str = Field(..., description="Primary responsibility of this component")
    key_interactions: List[str] = Field(default_factory=list, description="Other components this interacts with")
    technology: str = Field(..., description="Primary technology or framework used")


class HighLevelDesign(BaseModel):
    system_overview: str = Field(..., description="Concise description of the overall system decomposition")
    components: List[HLDComponent] = Field(default_factory=list, description="High-level software components")
    interaction_summary: str = Field(..., description="How components interact at a high level")


# ─── Section 3: Low-Level Design ────────────────────────────────────────────

class LLDModule(BaseModel):
    name: str = Field(..., description="Module, class, or service name")
    module_type: str = Field(..., description="Type: Service, Controller, Repository, Utility, Model, etc.")
    responsibility: str = Field(..., description="Specific responsibility")
    key_methods: List[str] = Field(default_factory=list, description="Key methods or operations with brief descriptions")
    dependencies: List[str] = Field(default_factory=list, description="Injected dependencies or consumed modules")
    design_pattern: str = Field(..., description="Applied design pattern if any (e.g., Repository, Factory, Observer)")


class LowLevelDesign(BaseModel):
    design_patterns_applied: List[str] = Field(default_factory=list, description="Cross-cutting design patterns")
    modules: List[LLDModule] = Field(default_factory=list, description="Detailed module/class definitions")
    error_handling_strategy: str = Field(..., description="How errors and exceptions are handled across the system")
    cross_cutting_concerns: List[str] = Field(default_factory=list, description="Logging, auth, caching, validation strategies")


# ─── Section 4: Technology Stack ─────────────────────────────────────────────

class TechEntry(BaseModel):
    layer: str = Field(..., description="Layer: Frontend, Backend, Database, DevOps, etc.")
    technology: str = Field(..., description="Technology or library name with version guidance")
    purpose: str = Field(..., description="Role this technology plays in the system")
    justification: str = Field(..., description="Why this specific technology was selected")


class TechStackDesign(BaseModel):
    technologies: List[TechEntry] = Field(default_factory=list, description="Detailed technology entries per layer")
    version_strategy: str = Field(..., description="How versions are managed and pinned")
    compatibility_notes: str = Field(..., description="Important compatibility or migration notes")


# ─── Section 5: Folder Structure ─────────────────────────────────────────────

class FolderStructure(BaseModel):
    structure_tree: str = Field(..., description="ASCII/text folder tree representation")
    description: str = Field(..., description="Explanation of the directory organization and conventions")
    key_directories: List[str] = Field(default_factory=list, description="Important directories with brief descriptions")
    naming_conventions: str = Field(..., description="File and folder naming conventions followed")


# ─── Section 6: Database Design ──────────────────────────────────────────────

class DBField(BaseModel):
    name: str = Field(..., description="Field/column name")
    data_type: str = Field(..., description="Data type")
    constraints: str = Field(..., description="NOT NULL, UNIQUE, DEFAULT, FK, etc.")
    description: str = Field(..., description="Field description and purpose")


class DBEntity(BaseModel):
    name: str = Field(..., description="Table or collection name")
    entity_type: str = Field(..., description="table, collection, index, view, etc.")
    description: str = Field(..., description="What this entity represents")
    fields: List[DBField] = Field(default_factory=list)
    relationships: List[str] = Field(default_factory=list, description="FK relationships and cardinality")
    indexes: List[str] = Field(default_factory=list, description="Index definitions for performance")


class DatabaseDesign(BaseModel):
    db_technology: str = Field(..., description="Primary database technology used")
    schema_strategy: str = Field(..., description="Normalization level, sharding, or schema design philosophy")
    entities: List[DBEntity] = Field(default_factory=list, description="Database entities / tables")
    migration_strategy: str = Field(..., description="How schema changes are managed")
    data_integrity_notes: str = Field(..., description="Constraints, cascades, and data integrity rules")


# ─── Section 7: API Specifications ───────────────────────────────────────────

class APIEndpoint(BaseModel):
    method: str = Field(..., description="HTTP method: GET, POST, PUT, DELETE, PATCH")
    path: str = Field(..., description="API path e.g. /api/v1/users/{id}")
    purpose: str = Field(..., description="What this endpoint does")
    request_body: str = Field(..., description="Request payload shape or 'None'")
    response_shape: str = Field(..., description="Response payload shape")
    auth_required: bool = Field(..., description="Whether authentication is required")
    status_codes: List[str] = Field(default_factory=list, description="Possible HTTP status codes")


class ApiSpecs(BaseModel):
    base_url: str = Field(..., description="API base URL path")
    auth_mechanism: str = Field(..., description="Authentication mechanism (JWT, OAuth2, API Key, etc.)")
    versioning_strategy: str = Field(..., description="How API versioning is handled")
    endpoints: List[APIEndpoint] = Field(default_factory=list, description="Defined API endpoints")
    rate_limiting: str = Field(..., description="Rate limiting strategy if applicable")
    error_response_format: str = Field(..., description="Standard error response shape")


# ─── Section 8: Diagrams — FIXED CONTRACT ─────────────────────────────────────
#
# The application schema defines EXACTLY three required diagram slots.
# The AI fills the content of each slot.
# The AI must NOT decide the number, type, or order of diagrams.
#
# Slot 1: ER Diagram      — starts with "erDiagram"
# Slot 2: Class Diagram   — starts with "classDiagram"
# Slot 3: Component Diagram — uses "graph TD" flowchart syntax
#
# The diagram_type field is a fixed constant on each model so that Gemini
# structured output cannot mutate or omit diagram types.

class ERDiagramSlot(BaseModel):
    """
    Fixed Slot 1: Entity-Relationship Diagram.
    mermaid_code MUST begin with 'erDiagram'.
    """
    diagram_type: str = Field(
        ...,
        description="Fixed value: 'er'. Do not change.",
    )
    title: str = Field(
        ...,
        description="Fixed title: 'ER Diagram'. Do not change.",
    )
    mermaid_code: str = Field(
        ...,
        description=(
            "Valid Mermaid erDiagram code. MUST start with 'erDiagram' on the first line. "
            "Include all major database entities defined in the database design section. "
            "Include entity attributes with data types. "
            "Include all relationships with proper cardinality notation (||--o{, etc.). "
            "Do NOT use any other Mermaid declaration type."
        ),
    )
    description: str = Field(..., description="What this ER diagram illustrates")

    @model_validator(mode="before")
    @classmethod
    def ensure_fixed_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            data.setdefault("diagram_type", "er")
            data.setdefault("title", "ER Diagram")
        return data

    @model_validator(mode="after")
    def validate_er_syntax(self) -> "ERDiagramSlot":
        code = self.mermaid_code.strip() if self.mermaid_code else ""
        if code and not code.startswith("erDiagram"):
            raise ValueError(
                f"ER Diagram mermaid_code must start with 'erDiagram'. "
                f"Got: '{code[:60]}...'"
            )
        return self


class ClassDiagramSlot(BaseModel):
    """
    Fixed Slot 2: Class Diagram.
    mermaid_code MUST begin with 'classDiagram'.
    """
    diagram_type: str = Field(
        ...,
        description="Fixed value: 'class'. Do not change.",
    )
    title: str = Field(
        ...,
        description="Fixed title: 'Class Diagram'. Do not change.",
    )
    mermaid_code: str = Field(
        ...,
        description=(
            "Valid Mermaid classDiagram code. MUST start with 'classDiagram' on the first line. "
            "Include all major classes, services, controllers, and repositories from the low-level design. "
            "Include important properties and methods. "
            "Show inheritance, composition, and dependency relationships. "
            "Do NOT use any other Mermaid declaration type."
        ),
    )
    description: str = Field(..., description="What this class diagram illustrates")

    @model_validator(mode="before")
    @classmethod
    def ensure_fixed_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            data.setdefault("diagram_type", "class")
            data.setdefault("title", "Class Diagram")
        return data

    @model_validator(mode="after")
    def validate_class_syntax(self) -> "ClassDiagramSlot":
        code = self.mermaid_code.strip() if self.mermaid_code else ""
        if code and not code.startswith("classDiagram"):
            raise ValueError(
                f"Class Diagram mermaid_code must start with 'classDiagram'. "
                f"Got: '{code[:60]}...'"
            )
        return self


class ComponentDiagramSlot(BaseModel):
    """
    Fixed Slot 3: Component/Architecture Diagram.
    mermaid_code MUST begin with 'graph TD' (top-down flowchart).
    This is the consistent Mermaid representation for component diagrams.
    """
    diagram_type: str = Field(
        ...,
        description="Fixed value: 'component'. Do not change.",
    )
    title: str = Field(
        ...,
        description="Fixed title: 'Component Diagram'. Do not change.",
    )
    mermaid_code: str = Field(
        ...,
        description=(
            "Valid Mermaid flowchart code for a component/architecture diagram. "
            "MUST start with 'graph TD' on the first line (top-down direction). "
            "Include all major architectural components: frontend, API gateway, "
            "controllers, services, repositories, database, auth, external integrations. "
            "Show meaningful communication/dependency relationships with labeled arrows. "
            "Use subgraph to group related components where appropriate. "
            "Do NOT use 'erDiagram', 'classDiagram', 'sequenceDiagram', or any other declaration. "
            "ONLY use 'graph TD'."
        ),
    )
    description: str = Field(..., description="What this component diagram illustrates")

    @model_validator(mode="before")
    @classmethod
    def ensure_fixed_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            data.setdefault("diagram_type", "component")
            data.setdefault("title", "Component Diagram")
        return data

    @model_validator(mode="after")
    def validate_component_syntax(self) -> "ComponentDiagramSlot":
        code = self.mermaid_code.strip() if self.mermaid_code else ""
        if code and not (code.startswith("graph TD") or code.startswith("graph LR") or code.startswith("flowchart TD") or code.startswith("flowchart LR")):
            raise ValueError(
                f"Component Diagram mermaid_code must start with 'graph TD'. "
                f"Got: '{code[:60]}...'"
            )
        return self


class DiagramsSection(BaseModel):
    """
    Fixed diagram contract: exactly three diagrams in deterministic order.

    The schema enforces:
    - Slot 1: er_diagram    (erDiagram syntax)
    - Slot 2: class_diagram (classDiagram syntax)
    - Slot 3: component_diagram (graph TD syntax)

    The AI fills content for each slot.
    The AI does NOT decide which diagrams exist, their order, or their count.
    """
    er_diagram: ERDiagramSlot
    class_diagram: ClassDiagramSlot
    component_diagram: ComponentDiagramSlot

    def as_ordered_list(self) -> list:
        """
        Returns the three diagrams as an ordered list for API serialization.
        Order is always: ER → Class → Component.
        """
        return [
            {
                "diagram_type": self.er_diagram.diagram_type,
                "title": self.er_diagram.title,
                "mermaid_code": self.er_diagram.mermaid_code,
                "description": self.er_diagram.description,
            },
            {
                "diagram_type": self.class_diagram.diagram_type,
                "title": self.class_diagram.title,
                "mermaid_code": self.class_diagram.mermaid_code,
                "description": self.class_diagram.description,
            },
            {
                "diagram_type": self.component_diagram.diagram_type,
                "title": self.component_diagram.title,
                "mermaid_code": self.component_diagram.mermaid_code,
                "description": self.component_diagram.description,
            },
        ]


# ─── Root: SoftwareDesignSections ────────────────────────────────────────────

class SoftwareDesignSections(BaseModel):
    """
    Complete 8-section software design output schema.
    Used as the Gemini structured output schema and for API serialization.
    """
    overview: DesignOverview
    high_level_design: HighLevelDesign
    low_level_design: LowLevelDesign
    technology_stack: TechStackDesign
    folder_structure: FolderStructure
    database_design: DatabaseDesign
    api_specifications: ApiSpecs
    diagrams: DiagramsSection

    def model_dump(self, **kwargs) -> dict:
        """
        Override model_dump to serialize diagrams as a normalized dict
        that the frontend can consume consistently.
        The 'diagrams' key contains the three named slots plus a convenience
        'diagrams_list' for ordered rendering.
        """
        data = super().model_dump(**kwargs)
        # Normalize diagrams to include both named fields and ordered list
        # so the frontend can consume either format.
        data["diagrams"] = {
            "er_diagram": {
                "diagram_type": self.diagrams.er_diagram.diagram_type,
                "title": self.diagrams.er_diagram.title,
                "mermaid_code": self.diagrams.er_diagram.mermaid_code,
                "description": self.diagrams.er_diagram.description,
            },
            "class_diagram": {
                "diagram_type": self.diagrams.class_diagram.diagram_type,
                "title": self.diagrams.class_diagram.title,
                "mermaid_code": self.diagrams.class_diagram.mermaid_code,
                "description": self.diagrams.class_diagram.description,
            },
            "component_diagram": {
                "diagram_type": self.diagrams.component_diagram.diagram_type,
                "title": self.diagrams.component_diagram.title,
                "mermaid_code": self.diagrams.component_diagram.mermaid_code,
                "description": self.diagrams.component_diagram.description,
            },
        }
        return data


# ─── API Request / Response Schemas ──────────────────────────────────────────

class SoftwareDesignGenerateRequest(BaseModel):
    """Request body for triggering software design generation."""
    blueprint_version: int = Field(
        ...,
        description=(
            "The specific Architecture Blueprint version to derive this software design from. "
            "Must be the version the user was viewing when initiating generation."
        )
    )


class SoftwareDesignVersionItem(BaseModel):
    """Version history metadata item for software designs."""
    version: int
    blueprint_version: int
    status: str
    created_at: datetime


class SoftwareDesignResponse(BaseModel):
    """Software Design API response schema."""
    id: UUID
    project_id: UUID
    blueprint_version: int
    version: int
    status: str
    sections: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
