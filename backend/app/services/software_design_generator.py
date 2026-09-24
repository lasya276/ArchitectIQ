"""
Software Design Generator Service Module.
Separate from architecture_generator.py — does NOT modify or touch the existing
architecture generation system. Uses the same Gemini integration pattern.

Generates structured 8-section software design documents derived from:
  - The existing Architecture Blueprint sections (the source of truth)
  - Project workspace specification
  - Questionnaire answers
"""
import json
import logging
from typing import Dict, Any, Optional

from google import genai
from google.genai import types
from pydantic import ValidationError

from app.models.project import Project
from app.models.workspace import ProjectWorkspace
from app.models.questionnaire import ProjectQuestionnaire
from app.schemas.software_design import SoftwareDesignSections
from app.core.config import settings

logger = logging.getLogger(__name__)


class SoftwareDesignGenerator:
    """
    AI-powered software design generator using Gemini.
    Produces structured 8-section software designs derived from a specific
    Architecture Blueprint version and the full project context.

    Does NOT have a deterministic fallback. If AI generation fails, raises
    an exception so the API endpoint can return a clear error to the user.
    """

    def generate_design(
        self,
        project: Project,
        workspace: Optional[ProjectWorkspace],
        questionnaire: Optional[ProjectQuestionnaire],
        blueprint_sections: Dict[str, Any],
        blueprint_version: int,
    ) -> Dict[str, Any]:
        """
        Generate a complete 8-section software design document.

        Args:
            project: The Project ORM instance
            workspace: The ProjectWorkspace ORM instance (may be None)
            questionnaire: The ProjectQuestionnaire ORM instance (may be None)
            blueprint_sections: The sections dict from the specific Architecture Blueprint version
            blueprint_version: The version number of the source Architecture Blueprint

        Returns:
            Dict[str, Any]: The validated software design sections as a dict

        Raises:
            RuntimeError: If GEMINI_API_KEY is not configured
            Exception: If AI generation or validation fails
        """
        if not settings.GEMINI_API_KEY:
            raise RuntimeError(
                "AI generation is not available: Gemini API key is not configured. "
                "Please contact your administrator."
            )

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = self._build_prompt(project, workspace, questionnaire, blueprint_sections, blueprint_version)

        logger.info(
            f"Invoking Gemini model {settings.GEMINI_MODEL} for Software Design generation — "
            f"project={project.id}, blueprint_version=v{blueprint_version}"
        )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SoftwareDesignSections,
                temperature=0.15,  # Low temperature for precise, deterministic software design output
            ),
        )

        if not response.text:
            raise ValueError("Empty response received from Gemini API during software design generation.")

        # Validate structured JSON against the SoftwareDesignSections Pydantic model
        design_model = SoftwareDesignSections.model_validate_json(response.text)
        logger.info(
            f"Successfully generated and validated Software Design for project={project.id} "
            f"from blueprint v{blueprint_version}"
        )
        return design_model.model_dump()

    def _build_prompt(
        self,
        project: Project,
        workspace: Optional[ProjectWorkspace],
        questionnaire: Optional[ProjectQuestionnaire],
        blueprint_sections: Dict[str, Any],
        blueprint_version: int,
    ) -> str:
        """
        Build the software design reasoning prompt for Gemini.

        Instructs Gemini to reason as a senior software designer, deriving a complete
        8-section software design that is consistent with and refines the Architecture Blueprint.
        """
        answers = (questionnaire.answers if questionnaire and questionnaire.answers else {}) or {}

        prompt_parts = [
            # ── Role & Framing ──────────────────────────────────────────────────────
            "You are a senior software designer and systems architect with deep expertise in",
            "translating high-level architecture blueprints into detailed, implementation-ready",
            "software design documents across all modern technology stacks.",
            "",
            "## YOUR TASK",
            "",
            f"Produce a complete 8-section Software Design document for the project described below.",
            f"This software design MUST be derived from and consistent with the provided Architecture",
            f"Blueprint v{blueprint_version}. Every decision in the software design must be traceable",
            "back to the architecture blueprint or the original project requirements.",
            "",
            "## INTERNAL REASONING PROCESS",
            "",
            "Before producing the final JSON, internally reason through each of the following steps.",
            "Do NOT expose this reasoning in the output. Only the final structured JSON must be returned.",
            "",
            "### STEP 1 — DEEPLY UNDERSTAND THE ARCHITECTURE BLUEPRINT",
            "Read and fully understand every section of the Architecture Blueprint:",
            "  - Architecture style and pattern type",
            "  - All components and their responsibilities",
            "  - Component relationships and interaction protocols",
            "  - Technology stack choices (frontend, backend, database, devops, third-party)",
            "  - Data architecture strategy and data stores",
            "  - Integrations required",
            "  - Security controls and quality attributes",
            "  - Key architecture decisions and their rationale",
            "  - Risks and trade-offs the architect identified",
            "  - The Mermaid architecture diagram",
            "The software design MUST be fully consistent with ALL of these.",
            "",
            "### STEP 2 — UNDERSTAND PROJECT REQUIREMENTS",
            "Also read and internalize:",
            "  - Project title and description",
            "  - Target users and user roles",
            "  - Business objectives",
            "  - Functional requirements",
            "  - Non-functional requirements (performance, security, availability, compliance)",
            "  - Technology preferences and constraints",
            "  - Scale expectations, team size, and timeline",
            "",
            "### STEP 3 — MAP ARCHITECTURE TO SOFTWARE MODULES",
            "For each major architectural component from the blueprint:",
            "  - Identify the corresponding software module(s) or packages",
            "  - Define the module's layer (Presentation, Application, Domain, Infrastructure)",
            "  - Specify the technology/framework that implements this component",
            "  - Define key classes, services, or controllers within each module",
            "  - Ensure module boundaries respect the architecture style (e.g., layered, hexagonal, modular)",
            "",
            "### STEP 4 — DESIGN THE FOLDER STRUCTURE",
            "Design a concrete folder/directory structure that:",
            "  - Reflects the selected architecture style from the blueprint",
            "  - Groups code by layer, feature, or domain as appropriate",
            "  - Is consistent with the selected tech stack's conventions",
            "  - Includes all identified modules and components",
            "  - Shows both frontend and backend structures if both are present",
            "",
            "### STEP 5 — DESIGN THE DATABASE SCHEMA",
            "Derive the database design from:",
            "  - The data architecture section of the blueprint",
            "  - The functional requirements (what entities the system must manage)",
            "  - The selected database technology",
            "Define specific tables/collections with fields, data types, constraints, and relationships.",
            "Do NOT invent entities not implied by the requirements or blueprint.",
            "",
            "### STEP 6 — SPECIFY API ENDPOINTS",
            "Define the API endpoints required to fulfill the functional requirements.",
            "For each endpoint specify: HTTP method, path, purpose, request body, response shape,",
            "auth requirement, and possible status codes.",
            "Endpoints must be consistent with the architecture's component interactions.",
            "Do NOT invent endpoints for features not in the requirements.",
            "",
            "### STEP 7 — SELECT DETAILED TECHNOLOGY STACK",
            "Refine the blueprint's high-level tech stack to specific libraries, ORMs, middleware,",
            "and tools. Every addition must be justified by a functional or NFR requirement.",
            "Respect user technology preferences from the questionnaire when technically sound.",
            "",
            "### STEP 8 — GENERATE MERMAID DIAGRAMS (FIXED CONTRACT)",
            "",
            "You MUST generate EXACTLY THREE diagrams. No more. No fewer.",
            "The diagram types, titles, and order are fixed by the application schema.",
            "You generate only the CONTENT (mermaid_code) of each predefined slot.",
            "Do NOT add extra diagrams. Do NOT omit any diagram. Do NOT change diagram types or order.",
            "",
            "══════════════════════════════════════════════",
            "DIAGRAM SLOT 1 — ER Diagram (er_diagram field)",
            "══════════════════════════════════════════════",
            "  - mermaid_code MUST start with exactly: erDiagram",
            "  - Represent ALL major database entities/tables from the database design section above.",
            "  - Include important columns/attributes with data types (e.g. string, int, boolean, datetime).",
            "  - Show primary key fields clearly.",
            "  - Show foreign key relationships.",
            "  - Use correct Mermaid cardinality notation: ||--o{, ||--|{, }o--||, etc.",
            "  - Include junction/association tables where applicable.",
            "  - Do NOT reduce a detailed database to only 2-3 representative tables.",
            "  - Do NOT use any Mermaid declaration other than erDiagram.",
            "  MERMAID SYNTAX RULES:",
            "    - Entity names: use PascalCase, no spaces, no special characters.",
            "    - Field syntax: FieldType fieldName PK/FK/UK 'description'",
            "    - Example:",
            "        erDiagram",
            "            USER {",
            "                uuid id PK",
            "                string email UK",
            "                string name",
            "                datetime created_at",
            "            }",
            "            PROJECT {",
            "                uuid id PK",
            "                uuid user_id FK",
            "                string title",
            "                string status",
            "            }",
            "            USER ||--o{ PROJECT : owns",
            "",
            "══════════════════════════════════════════════",
            "DIAGRAM SLOT 2 — Class Diagram (class_diagram field)",
            "══════════════════════════════════════════════",
            "  - mermaid_code MUST start with exactly: classDiagram",
            "  - Represent ALL major classes defined in the low-level design section above.",
            "  - Include controllers, services, repositories, domain models, and utilities.",
            "  - Include important properties with types.",
            "  - Include important methods with signatures.",
            "  - Show inheritance (--|>), composition (*--), aggregation (o--), and dependencies (..>).",
            "  - Do NOT reduce a detailed software design to only 2-3 classes.",
            "  - Do NOT use any Mermaid declaration other than classDiagram.",
            "  MERMAID SYNTAX RULES:",
            "    - Class names: PascalCase, no spaces.",
            "    - Properties: +Type name (public) or -Type name (private)",
            "    - Methods: +returnType methodName(params)",
            "    - Relationships on separate lines.",
            "    - Example:",
            "        classDiagram",
            "            class UserService {",
            "                -UserRepository repo",
            "                +User createUser(UserCreate data)",
            "                +User getUserById(UUID id)",
            "                +void deleteUser(UUID id)",
            "            }",
            "            class UserRepository {",
            "                -Session db",
            "                +User findById(UUID id)",
            "                +User findByEmail(string email)",
            "                +User save(User user)",
            "            }",
            "            UserService --> UserRepository : uses",
            "",
            "══════════════════════════════════════════════",
            "DIAGRAM SLOT 3 — Component Diagram (component_diagram field)",
            "══════════════════════════════════════════════",
            "  - mermaid_code MUST start with exactly: graph TD",
            "  - Use Mermaid flowchart (graph TD) syntax — this is the ONLY allowed declaration.",
            "  - Represent ALL major architectural components from the high-level design.",
            "  - Always include where applicable:",
            "      * Frontend (React/Vue/Angular etc.)",
            "      * API Gateway or Backend API layer",
            "      * Controllers/Route handlers",
            "      * Services/Business logic layer",
            "      * Repositories/Data access layer",
            "      * Database(s)",
            "      * Authentication/Auth service",
            "      * External APIs and third-party integrations",
            "      * AI/LLM services if present",
            "      * Storage services if present",
            "      * Message queues/event buses if present",
            "  - Use labeled arrows: A -->|action| B",
            "  - Use subgraph to group related components.",
            "  - Do NOT use erDiagram, classDiagram, sequenceDiagram, or any other declaration.",
            "  - Do NOT use component or architecture declarations.",
            "  MERMAID SYNTAX RULES:",
            "    - Node IDs: alphanumeric, no spaces, no special chars (use A, B, FE, API, etc.)",
            "    - Node labels: A[Frontend React App] or A((Database))",
            "    - Arrows: --> or -->|label|",
            "    - Subgraph: subgraph GroupName ... end",
            "    - Example:",
            "        graph TD",
            "            subgraph Frontend",
            "                FE[React SPA]",
            "            end",
            "            subgraph Backend",
            "                API[FastAPI Gateway]",
            "                AUTH[Auth Service]",
            "                SVC[Business Service]",
            "                REPO[Repository Layer]",
            "            end",
            "            DB[(PostgreSQL)]",
            "            FE -->|HTTP/REST| API",
            "            API --> AUTH",
            "            API --> SVC",
            "            SVC --> REPO",
            "            REPO --> DB",
            "",
            "══════════════════════════════════════════════",
            "MERMAID SYNTAX CRITICAL RULES (apply to ALL diagrams):",
            "══════════════════════════════════════════════",
            "  - Use REAL newline characters between lines (not backslash-n literal strings).",
            "  - Do NOT use HTML tags or special characters in labels.",
            "  - Do NOT use parentheses in node IDs.",
            "  - Do NOT use quotes inside node labels unless required by the syntax.",
            "  - Keep entity/class/node names short and alphanumeric.",
            "  - Validate that every opened brace/bracket is closed.",
            "  - Every relationship line must reference valid entity/class/node names.",
            "",
            "### STEP 9 — INTERNAL CONSISTENCY CHECK",
            "Before emitting the final JSON, verify ALL of the following:",
            "  [ ] Software design is fully consistent with the Architecture Blueprint",
            "  [ ] All architectural components have corresponding software modules",
            "  [ ] Folder structure reflects the module decomposition",
            "  [ ] Database schema supports all functional requirements",
            "  [ ] API endpoints cover all user-facing operations",
            "  [ ] Technology stack entries are specific (library names, not just 'ORM' or 'framework')",
            "  [ ] ER diagram entities match the database design entities",
            "  [ ] No software decisions contradict the architecture blueprint",
            "  [ ] No modules, entities, or endpoints are invented without requirement basis",
            "  [ ] All Mermaid.js code is syntactically valid",
            "  [ ] diagrams.er_diagram.mermaid_code starts with 'erDiagram'",
            "  [ ] diagrams.class_diagram.mermaid_code starts with 'classDiagram'",
            "  [ ] diagrams.component_diagram.mermaid_code starts with 'graph TD'",
            "  [ ] Exactly THREE diagram slots are filled (er_diagram, class_diagram, component_diagram)",
            "  [ ] No diagram mermaid_code is empty or contains only whitespace",
            "  [ ] No literal backslash-n sequences in mermaid_code fields (use real newlines)",
            "",
            "## OUTPUT REQUIREMENTS",
            "Return ONLY the structured JSON matching the required schema.",
            "Do NOT output analysis, planning text, chain-of-thought, or any explanation outside the JSON.",
            "All text fields (descriptions, justifications, strategies) must be concise and professional.",
            "",
            # ── Architecture Blueprint (Source of Truth) ───────────────────────────
            f"## ARCHITECTURE BLUEPRINT v{blueprint_version} (SOURCE OF TRUTH)",
            "",
            "The following is the complete Architecture Blueprint that this software design must derive from.",
            "Every section of your software design must be traceable to this blueprint.",
            "",
            json.dumps(blueprint_sections, indent=2),
            "",
        ]

        # ── Project Context ────────────────────────────────────────────────────────
        prompt_parts.extend([
            "## PROJECT CONTEXT",
            f"Project Title: {project.title or 'Untitled Project'}",
            f"Project Description: {project.description or 'No description provided'}",
            "",
        ])

        # ── Workspace Specification ────────────────────────────────────────────────
        if workspace:
            prompt_parts.extend([
                "## WORKSPACE SPECIFICATION",
                f"Vision: {workspace.vision or 'N/A'}",
                f"Problem Statement: {workspace.problem_statement or 'N/A'}",
                f"Requirements: {workspace.requirements or 'N/A'}",
                f"Constraints: {workspace.constraints or 'N/A'}",
                f"Business Goals: {workspace.business_goals or 'N/A'}",
                f"Stakeholders: {workspace.stakeholders or 'N/A'}",
                f"Target Users: {workspace.target_users or 'N/A'}",
                "",
            ])

        # ── Questionnaire Details ──────────────────────────────────────────────────
        if answers:
            prompt_parts.extend([
                "## QUESTIONNAIRE DETAILS",
                f"Category / Industry: {answers.get('project_category', 'N/A')} / {answers.get('industry', 'N/A')}",
                f"Expected Users (Scale): {answers.get('expected_users', 'N/A')}",
                f"Platforms: {answers.get('platforms', 'N/A')}",
                f"Timeline: {answers.get('timeline', 'N/A')}",
                f"Team Size: {answers.get('team_size', 'N/A')}",
                f"Priority: {answers.get('priority', 'N/A')}",
                f"Functional Requirements: {answers.get('functional_requirements', 'N/A')}",
                f"Non-Functional Requirements: {answers.get('non_functional_requirements', 'N/A')}",
                f"Integrations: {answers.get('integrations', 'N/A')}",
                f"Tech Preferences: {answers.get('tech_preferences', 'N/A')}",
                "",
            ])

        prompt_parts.append(
            f"Using the Architecture Blueprint v{blueprint_version} above as the primary source of truth, "
            "and the project context provided, produce the complete structured JSON Software Design document now."
        )

        return "\n".join(prompt_parts)
