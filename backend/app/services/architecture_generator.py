"""
Architecture Generator Service Module.
Provides abstract interface and grounded deterministic implementation for synthesizing
structured 11-section architecture blueprints from Workspace Specifications.
Designed to allow pluggable AI/LLM generators in Phase 3B.3 without schema changes.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import re
import json
import logging
from google import genai
from google.genai import types
from pydantic import ValidationError

from app.models.project import Project
from app.models.workspace import ProjectWorkspace
from app.models.questionnaire import ProjectQuestionnaire
from app.schemas.blueprint import BlueprintSections
from app.core.config import settings

logger = logging.getLogger(__name__)


class ArchitectureGeneratorInterface(ABC):
    """Abstract interface for Architecture Blueprint Generation Engines."""

    @abstractmethod
    def generate_blueprint(
        self,
        project: Project,
        workspace: Optional[ProjectWorkspace],
        questionnaire: Optional[ProjectQuestionnaire] = None,
    ) -> Dict[str, Any]:
        """
        Generate complete 11-section architecture blueprint grounded in workspace specification.
        """
        pass


class DeterministicGroundedGenerator(ArchitectureGeneratorInterface):
    """
    Grounded deterministic architecture generator.
    Strictly uses actual project workspace specifications and structured questionnaire answers.
    Never invents unprovided requirements, users, scale, or constraints.
    """

    def generate_blueprint(
        self,
        project: Project,
        workspace: Optional[ProjectWorkspace],
        questionnaire: Optional[ProjectQuestionnaire] = None,
    ) -> Dict[str, Any]:
        answers = (questionnaire.answers if questionnaire and questionnaire.answers else {}) or {}

        # ── 1. Extract raw grounded data ─────────────────────────────────────────
        title = (project.title or "").strip() or "Untitled Project"
        description = (project.description or "").strip()
        vision = (workspace.vision if workspace else "") or ""
        problem_statement = (workspace.problem_statement if workspace else "") or ""
        requirements_text = (workspace.requirements if workspace else "") or ""
        constraints_text = (workspace.constraints if workspace else "") or ""
        business_goals_text = (workspace.business_goals if workspace else "") or ""
        stakeholders_text = (workspace.stakeholders if workspace else "") or ""
        target_users_text = (workspace.target_users if workspace else "") or ""

        # Extract structured answers if present
        category = answers.get("project_category", "")
        industry = answers.get("industry", "")
        platforms = answers.get("platforms", []) if isinstance(answers.get("platforms"), list) else []
        expected_users = str(answers.get("expected_users", ""))
        timeline = str(answers.get("timeline", ""))
        team_size = str(answers.get("team_size", ""))
        priority = str(answers.get("priority", ""))
        integrations_list = answers.get("integrations", []) if isinstance(answers.get("integrations"), list) else []
        nfr_list = answers.get("non_functional_requirements", []) if isinstance(answers.get("non_functional_requirements"), list) else []
        func_reqs = answers.get("functional_requirements", []) if isinstance(answers.get("functional_requirements"), list) else []

        # ── 2. Section 1: Overview ───────────────────────────────────────────────
        domain_val = self._clean_str(industry) or self._extract_field(vision, r"Industry Domain:\s*(.+)") or "General Software"
        primary_focus_val = self._clean_str(priority) or self._extract_field(vision, r"Top Priority:\s*(.+)") or "Functional Completeness & Reliability"
        scope_val = self._clean_str(expected_users) or self._extract_field(constraints_text, r"Expected Users[^\n]*:\s*(.+)") or "Standard User Base"

        summary_text = (
            description
            or self._extract_field(vision, r"Project Overview:\s*(.+)")
            or f"Architecture specification for {title} serving the {domain_val} domain."
        )

        overview = {
            "summary": summary_text,
            "domain": domain_val,
            "primary_focus": primary_focus_val,
            "scope": f"Deployment scale target: {scope_val}",
        }

        # ── 3. Section 2: Architecture Style / Pattern ───────────────────────────
        # Ground style choice strictly on scale, team size, and platforms
        is_large_team = any(k in team_size.lower() for k in ["16_50", "50_plus", "large", "enterprise"]) or "Large" in constraints_text
        is_multi_platform = len(platforms) > 1 or "Mobile" in requirements_text

        if is_large_team:
            style_name = "Event-Driven Modular Microservices"
            pattern_type = "Domain-Driven Services, API Gateway, Async Event Broker"
            justification = f"Adopted to support multi-team parallel development ({team_size or 'large team capacity'}) and independent service deployment."
        else:
            style_name = "Modular Monolith with Layered Architecture"
            pattern_type = "Separation of Concerns (API / Core Domain / Data Access Layer)"
            justification = f"Optimized for high delivery velocity, streamlined deployment, and low operational overhead based on team capacity."

        architecture_style = {
            "style_name": style_name,
            "pattern_type": pattern_type,
            "justification": justification,
        }

        # ── 4. Section 3: Technology Stack ───────────────────────────────────────
        fe_stack: List[str] = []
        if "web" in [p.lower() for p in platforms] or "Web" in requirements_text:
            fe_stack.append("Modern Web Client (React / TypeScript SPA)")
        if any("mobile" in p.lower() for p in platforms) or "Mobile" in requirements_text:
            fe_stack.append("Cross-Platform Mobile Client (React Native / Mobile SDK)")
        if not fe_stack:
            fe_stack.append("Web Application Frontend" if "web" in category.lower() else "Client Interface (Not specified)")

        be_stack: List[str] = ["RESTful API Backend (Python FastAPI / Node.js Service Layer)"]

        db_stack: List[str] = ["Relational ACID Store (PostgreSQL)"]
        if "analytics" in requirements_text.lower() or "reporting" in requirements_text.lower():
            db_stack.append("Analytical / Document Store (Optimized Read Replica)")

        devops_stack: List[str] = ["Containerized Deployment (Docker)", "CI/CD Pipeline Workflow"]
        if "aws" in constraints_text.lower():
            devops_stack.append("Cloud Hosting (AWS ECS / RDS)")
        elif "cloud" in [p.lower() for p in platforms] or "cloud" in requirements_text.lower():
            devops_stack.append("Cloud Infrastructure (Cloud PaaS / Managed Services)")

        third_party_stack: List[str] = []
        for item in integrations_list:
            if item and item.lower() != "none" and item.lower() != "no integrations required":
                third_party_stack.append(self._format_token(item))

        tech_stack = {
            "frontend": fe_stack,
            "backend": be_stack,
            "database": db_stack,
            "devops_infrastructure": devops_stack,
            "third_party_services": third_party_stack if third_party_stack else ["None specified"],
        }

        # ── 5. Section 4: System Components ──────────────────────────────────────
        components: List[Dict[str, Any]] = [
            {
                "name": "API Gateway / Routing Layer",
                "type": "Gateway & Security",
                "responsibility": "Request routing, TLS termination, rate limiting, and session verification.",
                "interfaces": ["HTTPS REST API", "JSON Payload"],
            },
            {
                "name": "Core Application Service",
                "type": "Domain Logic",
                "responsibility": f"Executes business logic and core workflows for {title}.",
                "interfaces": ["Internal Service Bus", "Repository Interface"],
            },
            {
                "name": "Persistence & Storage Layer",
                "type": "Data Tier",
                "responsibility": "Structured relational data management, transactions, and consistency.",
                "interfaces": ["SQL Connection Pool", "ORM Data Models"],
            },
        ]

        # Extract specific functional components from requirements
        req_lines = [line.strip() for line in requirements_text.split("\n") if line.strip().startswith("•")]
        if req_lines:
            for line in req_lines[:4]:
                clean_req = re.sub(r"^•\s*(\[[^\]]+\]\s*)?", "", line).strip()
                if clean_req:
                    components.append({
                        "name": f"{clean_req[:35]} Module",
                        "type": "Functional Feature Module",
                        "responsibility": f"Handles functional requirement: {clean_req}",
                        "interfaces": ["REST Endpoints", "Domain Handlers"],
                    })

        # ── 6. Section 5: Component Relationships ────────────────────────────────
        relationships: List[Dict[str, Any]] = [
            {
                "source": "Client Layer (Web/Mobile)",
                "target": "API Gateway / Routing Layer",
                "interaction": "Sends authenticated user requests over TLS",
                "protocol": "HTTPS / JSON",
            },
            {
                "source": "API Gateway / Routing Layer",
                "target": "Core Application Service",
                "interaction": "Forwards validated payload for domain processing",
                "protocol": "Internal HTTP / RPC",
            },
            {
                "source": "Core Application Service",
                "target": "Persistence & Storage Layer",
                "interaction": "Queries and commits transactional entities",
                "protocol": "PostgreSQL Driver / Pool",
            },
        ]

        if third_party_stack and third_party_stack[0] != "None specified":
            for integration in third_party_stack[:3]:
                relationships.append({
                    "source": "Core Application Service",
                    "target": f"External Service ({integration})",
                    "interaction": f"Integrates third-party service for {integration}",
                    "protocol": "External HTTPS API",
                })

        # ── 7. Section 6: Data Architecture ──────────────────────────────────────
        data_architecture = {
            "storage_strategy": "Relational Multi-Tenant Data Store with strict foreign key constraints and transactional consistency.",
            "data_stores": db_stack,
            "data_flow": "Client Requests → API Gateway Validation → Domain Business Service → ORM Layer → Primary Relational Database.",
        }

        # ── 8. Section 7: External Integrations ──────────────────────────────────
        integrations: List[Dict[str, Any]] = []
        if third_party_stack and third_party_stack[0] != "None specified":
            for item in third_party_stack:
                integrations.append({
                    "name": item,
                    "purpose": f"External integration required by system specification for {item}.",
                    "protocol": "REST / Webhooks (HTTPS)",
                })
        else:
            integrations.append({
                "name": "No External Integrations",
                "purpose": "All functionality contained within core platform boundaries.",
                "protocol": "N/A",
            })

        # ── 9. Section 8: Security & Quality Considerations ──────────────────────
        sec_controls = [
            "HTTP-Only Secure Cookie / JWT Token Authentication",
            "Role-Based Access Control (RBAC) with strict tenant data isolation",
            "Parameterized Queries & Input Sanitization (OWASP compliance)",
        ]
        quality_attrs = [
            "Data Integrity & ACID Transaction Guarantees",
            "Maintainable Modular Codebase Structure",
            "Responsive Cross-Platform Client Support",
        ]
        compliance_items = []
        if "hipaa" in constraints_text.lower() or "hipaa" in requirements_text.lower():
            compliance_items.append("HIPAA (Health Insurance Portability & Accountability Act)")
        if "pci" in constraints_text.lower() or "pci" in requirements_text.lower():
            compliance_items.append("PCI-DSS (Payment Card Industry Data Security Standard)")
        if "gdpr" in constraints_text.lower() or "gdpr" in requirements_text.lower():
            compliance_items.append("GDPR (General Data Protection Regulation)")
        if not compliance_items:
            compliance_items.append("Standard Industry Web Security & Privacy Standards")

        security_and_quality = {
            "security_controls": sec_controls,
            "quality_attributes": quality_attrs,
            "compliance": compliance_items,
        }

        # ── 10. Section 9: Architecture Decisions & Rationale ────────────────────
        decisions: List[Dict[str, Any]] = [
            {
                "decision": f"Adopt {style_name}",
                "rationale": justification,
                "grounded_requirement": f"Based on declared scope '{scope_val}' and delivery timeline constraints.",
                "alternatives_considered": ["Distributed Microservices", "Serverless Functions only"],
            },
            {
                "decision": "Use PostgreSQL as Primary Transactional Store",
                "rationale": "Provides robust schema validation, relational integrity, ACID transactions, and native JSONB document flexibility.",
                "grounded_requirement": "Matches requirement for reliable data management and flexible specification storage.",
                "alternatives_considered": ["Pure NoSQL Document DB", "Embedded SQLite"],
            },
        ]

        if fe_stack:
            decisions.append({
                "decision": f"Standardize on {fe_stack[0]}",
                "rationale": "Ensures responsive UI, component reusability, and rapid iteration across target user workflows.",
                "grounded_requirement": f"Derived from target platforms: {', '.join(platforms) if platforms else 'Web'}",
                "alternatives_considered": ["Server-Rendered Multi-Page Application (MPA)"],
            })

        # ── 11. Section 10: Risks & Trade-offs ───────────────────────────────────
        risks: List[Dict[str, Any]] = [
            {
                "risk": "Timeline Compression & Scope Creep",
                "impact": f"Target delivery timeline ({timeline or 'estimated schedule'}) may be pressured by complex feature additions.",
                "mitigation": "Prioritize Must-Have functional requirements first and defer Could-Have features.",
                "tradeoff": "Favoring rapid MVP delivery over exhaustive initial feature breadth.",
            },
            {
                "risk": "Third-Party Service Availability",
                "impact": "Outages or latency spikes in external APIs may impact user workflows.",
                "mitigation": "Implement timeout controls, circuit breakers, and fallback error handling on external endpoints.",
                "tradeoff": "Added engineering effort for resilience vs. reliance on managed external capabilities.",
            },
        ]

        # ── 12. Section 11: Visual Architecture Diagram ──────────────────────────
        mermaid_code = (
            "graph TD\n"
            "    Client[Client Applications: Web / Mobile] -->|HTTPS / TLS| Gateway[API Gateway & Auth Layer]\n"
            "    Gateway --> CoreService[Core Application Service]\n"
            "    CoreService --> DB[(Primary Database: PostgreSQL)]\n"
        )
        if third_party_stack and third_party_stack[0] != "None specified":
            mermaid_code += "    CoreService -->|REST / Webhooks| ExternalServices[External Services & APIs]\n"

        visual_diagram = {
            "diagram_type": "System Component Flow Diagram",
            "mermaid_code": mermaid_code.strip(),
            "description": f"High-level architectural flow representing client interaction through the API Gateway, core business layer, and storage tier for {title}.",
        }

        # ── 13. Assemble Complete 11-Section Blueprint ───────────────────────────
        return {
            "overview": overview,
            "architecture_style": architecture_style,
            "tech_stack": tech_stack,
            "components": components,
            "component_relationships": relationships,
            "data_architecture": data_architecture,
            "integrations": integrations,
            "security_and_quality": security_and_quality,
            "decisions_and_rationale": decisions,
            "risks_and_tradeoffs": risks,
            "visual_diagram": visual_diagram,
        }

    # ── Helpers ──────────────────────────────────────────────────────────────
    @staticmethod
    def _extract_field(text: str, pattern: str) -> Optional[str]:
        if not text:
            return None
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else None

    @staticmethod
    def _clean_str(val: Any) -> str:
        if not val:
            return ""
        return str(val).strip().replace("_", " ").title()

    @staticmethod
    def _format_token(token: str) -> str:
        if not token:
            return ""
        return token.replace("_", " ").title()


class AIGenerator(ArchitectureGeneratorInterface):
    """
    AI-powered architecture generator using Gemini.
    Generates structured architecture blueprints based on project requirements.
    Falls back to DeterministicGroundedGenerator on failure.
    """

    def generate_blueprint(
        self,
        project: Project,
        workspace: Optional[ProjectWorkspace],
        questionnaire: Optional[ProjectQuestionnaire] = None,
    ) -> Dict[str, Any]:
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured. Falling back to deterministic generator.")
            return DeterministicGroundedGenerator().generate_blueprint(project, workspace, questionnaire)

        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            prompt = self._build_prompt(project, workspace, questionnaire)
            
            logger.info(f"Invoking Gemini model {settings.GEMINI_MODEL} for project {project.id}")
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=BlueprintSections,
                    temperature=0.2, # Low temperature for more analytical/architectural responses
                ),
            )
            
            if not response.text:
                raise ValueError("Empty response received from Gemini API")

            # Validate the structured JSON against the existing Pydantic model
            blueprint_model = BlueprintSections.model_validate_json(response.text)
            logger.info(f"Successfully generated and validated AI blueprint for project {project.id}")
            return blueprint_model.model_dump()
            
        except (ValidationError, ValueError, Exception) as e:
            logger.error(f"AI Blueprint generation failed: {str(e)}. Falling back to deterministic generator.")
            return DeterministicGroundedGenerator().generate_blueprint(project, workspace, questionnaire)

    def _build_prompt(
        self,
        project: Project,
        workspace: Optional[ProjectWorkspace],
        questionnaire: Optional[ProjectQuestionnaire]
    ) -> str:
        """
        Build the architectural reasoning prompt for Gemini.

        Instructs Gemini to reason as a senior solution architect using a structured
        14-step internal reasoning framework before producing the final JSON blueprint.
        All project, workspace, and questionnaire fields are forwarded unchanged.
        """
        answers = (questionnaire.answers if questionnaire and questionnaire.answers else {}) or {}

        prompt_parts = [
            # ── Role & Framing ─────────────────────────────────────────────────────────
            "You are a senior software architect and solution architect with extensive production experience",
            "across diverse domains: consumer apps, enterprise platforms, healthcare, fintech, IoT, AI/ML,",
            "e-commerce, government systems, and more.",
            "",
            "## INTERNAL ARCHITECTURAL REASONING PROCESS",
            "",
            "Before producing the final JSON, internally reason through each of the following steps.",
            "Do NOT expose this reasoning in the output. Only the final structured JSON must be returned.",
            "",
            "### STEP 1 — UNDERSTAND THE PROJECT",
            "Read every piece of supplied information thoroughly:",
            "  - Project title and description",
            "  - Domain / industry",
            "  - Target users and user roles",
            "  - Business goals and objectives",
            "  - Functional requirements (explicit features)",
            "  - Non-functional requirements (performance, availability, security, compliance, etc.)",
            "  - Target platforms",
            "  - Required third-party integrations",
            "  - Expected user scale",
            "  - Team size and delivery timeline",
            "  - Constraints and technology preferences",
            "Do NOT rely on the project title alone to infer requirements.",
            "",
            "### STEP 2 — IDENTIFY ARCHITECTURAL DRIVERS",
            "Identify the most important architectural drivers for THIS specific project.",
            "Relevant drivers may include (select only those that apply):",
            "  expected user scale, response latency, throughput, availability SLA, reliability,",
            "  data security, privacy, regulatory compliance (HIPAA, PCI-DSS, GDPR, SOC2),",
            "  maintainability, cost efficiency, team size, delivery timeline, real-time requirements,",
            "  data volume, integration complexity, platform diversity, AI/ML requirements,",
            "  IoT edge constraints, offline capability, audit/reporting needs.",
            "Rank drivers by relevance. Do NOT treat every concern as equally important.",
            "",
            "### STEP 3 — DISTINGUISH REQUIREMENTS FROM ASSUMPTIONS",
            "Strictly enforce these rules:",
            "  - NEVER invent requirements not present in the supplied information.",
            "  - NEVER invent integrations, user roles, business goals, or external services.",
            "  - NEVER assume large-scale traffic without explicit evidence.",
            "  - NEVER assume microservices are required unless scale, team size, or domain isolation justifies it.",
            "  - NEVER assume cloud infrastructure is required unless specified.",
            "  - When information is missing, make CONSERVATIVE and REASONABLE architectural choices.",
            "  - If user-provided technology preferences conflict with requirements, choose the technically",
            "    sound option and explain the trade-off in the decisions_and_rationale section.",
            "",
            "### STEP 4 — SELECT AN APPROPRIATE ARCHITECTURE STYLE",
            "Choose the architecture style that best fits THIS project. Candidates include (not exhaustive):",
            "  Modular Monolith, Layered Architecture, Microservices, Event-Driven Architecture,",
            "  Serverless, Service-Oriented Architecture, Client-Server, CQRS, Hexagonal Architecture,",
            "  or any other style justified by the requirements.",
            "The chosen style MUST be justified by actual project requirements and constraints.",
            "Do NOT default to microservices or distributed systems unless clearly justified.",
            "",
            "### STEP 5 — KEEP COMPLEXITY PROPORTIONAL TO THE PROJECT",
            "Architecture complexity must be proportional to the project's scale, expected users,",
            "team size, timeline, functional requirements, and business needs.",
            "Avoid introducing the following UNLESS there is a clear, requirement-driven reason:",
            "  - Microservices decomposition",
            "  - Message brokers (Kafka, RabbitMQ, NATS, etc.)",
            "  - Container orchestration (Kubernetes, Nomad)",
            "  - Multiple heterogeneous databases",
            "  - Distributed caching layers (Redis, Memcached)",
            "  - Search engines (Elasticsearch, OpenSearch)",
            "  - CDNs and multi-region deployments",
            "  - Data lakes, data warehouses, or analytics pipelines",
            "A SIMPLE project (e.g., a college event app, small internal tool, portfolio site) MUST receive",
            "a SIMPLE architecture. A COMPLEX project (large e-commerce, healthcare platform, real-time",
            "AI/ML system, financial transaction engine) SHOULD receive an appropriately scalable architecture.",
            "",
            "### STEP 6 — SELECT TECHNOLOGIES BASED ON REQUIREMENTS",
            "For every major technology choice, provide a concise architectural justification tied to a",
            "specific requirement or driver — not because it is popular or widely adopted.",
            "  - Respect user-provided technology preferences when technically reasonable.",
            "  - Do NOT add a second database without a clear requirement-driven reason.",
            "  - Do NOT introduce technologies that serve no explicit requirement in this project.",
            "",
            "### STEP 7 — DEFINE PROJECT-SPECIFIC COMPONENTS",
            "Components MUST represent meaningful responsibilities derived from the ACTUAL functional",
            "requirements of this project. Avoid generic or placeholder components.",
            "Examples of project-specific component names:",
            "  - 'Patient Record Service' for a healthcare app",
            "  - 'Order Processing Engine' for an e-commerce platform",
            "  - 'Event Registration Module' for a college event management app",
            "  - 'Sensor Data Ingestion Service' for an IoT system",
            "Every component must have a clear responsibility tied to an actual functional requirement.",
            "",
            "### STEP 8 — DEFINE MEANINGFUL COMPONENT RELATIONSHIPS",
            "Every relationship must represent a real interaction or dependency.",
            "Relationships must align with the selected architecture style, components, and tech stack.",
            "Avoid decorative, trivial, or implied-but-never-used relationships.",
            "",
            "### STEP 9 — ENSURE DATA ARCHITECTURE FITS THE PROJECT",
            "Data architecture must align with domain requirements, data characteristics, scale,",
            "consistency requirements, performance needs, reporting/analytics needs, and security/privacy.",
            "Do NOT introduce multiple databases without a requirement-driven justification.",
            "",
            "### STEP 10 — HANDLE INTEGRATIONS CORRECTLY",
            "Include ONLY external integrations explicitly provided by the user or clearly implied by",
            "the supplied project information. Do NOT invent third-party services.",
            "If no integrations are required, state so clearly — do not add arbitrary external services.",
            "",
            "### STEP 11 — MAKE ARCHITECTURE DECISIONS TRACEABLE",
            "Each major architecture decision must trace the following chain:",
            "  Requirement or Architectural Driver → Architecture Decision → Reason and Trade-off",
            "The blueprint must explain WHY important decisions were made.",
            "Do NOT expose raw chain-of-thought — provide concise, professional architectural rationale.",
            "",
            "### STEP 12 — IDENTIFY PROJECT-SPECIFIC RISKS AND TRADE-OFFS",
            "Risks and trade-offs must relate to the ACTUAL architecture and project context.",
            "Avoid generic statements that could apply to any software project.",
            "",
            "### STEP 13 — GENERATE A CONSISTENT MERMAID DIAGRAM",
            "Generate the Mermaid diagram ONLY after the full architecture is determined.",
            "The diagram MUST:",
            "  - Use valid Mermaid syntax (graph TD or appropriate type)",
            "  - Represent the ACTUAL selected components",
            "  - Show MEANINGFUL interactions and dependencies",
            "  - Match the selected architecture style",
            "  - Use the same major component names as described in other sections",
            "  - NOT introduce components absent from other sections",
            "  - NOT omit major architectural components",
            "",
            "### STEP 14 — INTERNAL CONSISTENCY CHECK",
            "Before emitting the final JSON, internally verify all of the following:",
            "  [ ] Architecture style matches the selected components and relationships",
            "  [ ] Components reflect actual functional requirements (not generic)",
            "  [ ] Technology stack supports the components and non-functional requirements",
            "  [ ] Data architecture supports the system's actual data needs",
            "  [ ] Integrations match only user-provided or clearly implied integrations",
            "  [ ] Security decisions match declared security, privacy, and compliance requirements",
            "  [ ] Scalability decisions match declared expected user scale",
            "  [ ] Architecture complexity is proportional to project size and team capability",
            "  [ ] Mermaid diagram faithfully represents the selected architecture",
            "  [ ] Each architecture decision has a meaningful, traceable rationale",
            "  [ ] Risks are project-specific and non-generic",
            "  [ ] No unnecessary or unjustified technologies were introduced",
            "",
            "## OUTPUT REQUIREMENTS",
            "Return ONLY the structured JSON matching the required schema.",
            "Do NOT output analysis, planning text, chain-of-thought, or any explanation outside the JSON.",
            "Blueprint fields (summaries, justifications, rationale, risks) should contain concise,",
            "professional architectural explanations — not raw reasoning notes.",
            "",
            # ── Project Context ────────────────────────────────────────────────────────
            "## PROJECT CONTEXT",
            f"Project Title: {project.title or 'Untitled Project'}",
            f"Project Description: {project.description or 'No description provided'}",
            "",
        ]

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
            "Using ALL of the above project context and your internal architectural reasoning process, "
            "produce the structured JSON architecture blueprint now."
        )

        return "\n".join(prompt_parts)


def get_architecture_generator() -> ArchitectureGeneratorInterface:
    """Factory function for architecture generator engine."""
    return AIGenerator()
