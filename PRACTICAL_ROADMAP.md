# ArchitectIQ — Practical MVP Implementation Roadmap

**Target Audience:** Developer / Student building ArchitectIQ step by step with AI coding tools  
**Source of Truth:** Approved ArchitectIQ Software Architecture Document (SAD v1.0)  

---

### Phase 1: Project Setup & Base Infrastructure

- **Objective:** Set up the basic project foundation, database services, and UI layout frame.
- **Modules:**
  - Frontend setup (React + TypeScript + Tailwind CSS)
  - Backend API setup (FastAPI)
  - Relational database initialization (PostgreSQL)
  - Vector database initialization (ChromaDB local instance)
  - Docker container configuration for local database services
  - Main application shell layout (Navigation bar, Sidebar, Theme switcher)
- **Expected Outcome:** A running backend and frontend skeleton with active database connections and a clean workspace UI shell.

---

### Phase 2: Authentication & Project Workspace

- **Objective:** Allow users to create accounts, log in securely, and manage software planning projects.
- **Modules:**
  - User registration and login views
  - JWT authentication and session management
  - Project Dashboard UI (List projects, create new project, delete project)
  - Project Metadata store (Title, description, target domain, status badges)
  - Workspace state navigation (Draft, Intake, Blueprint, Export)
- **Expected Outcome:** A secure system where users can register, sign in, and create/manage software project workspaces.

---

### Phase 3: Interactive Requirements Intake Engine

- **Objective:** Guide users through turning a rough software idea into structured project requirements using AI analysis.
- **Modules:**
  - High-level project idea entry interface
  - AI requirement gap analyzer (identifies missing technical details)
  - Dynamic follow-up questionnaire component
  - User constraint collector (Budget, timeline, technical preferences, scale targets)
  - Structured intake data persistence
- **Expected Outcome:** A step-by-step intake wizard that asks intelligent follow-up questions and captures complete project requirements.

---

### Phase 4: RAG Knowledge Base & Retrieval Subsystem

- **Objective:** Build the vector retrieval pipeline to ground AI generation in trusted software engineering patterns.
- **Modules:**
  - Engineering knowledge base corpus (design patterns, security standards, database choice guides)
  - Text chunking and embedding generation pipeline
  - Vector knowledge store indexing in ChromaDB
  - Semantic context retriever (fetches top matching patterns for project requirements)
  - Prompt augmentation layer (combines project intake data with engineering patterns)
- **Expected Outcome:** An automated RAG pipeline capable of fetching relevant engineering best practices within milliseconds.

---

### Phase 5: Blueprint Generation & Editing Canvas

- **Objective:** Generate all 23 blueprint sections independently and allow users to view, edit, or regenerate individual sections.
- **Expected Outcome:** A full software blueprint workspace displaying all 23 engineering sections with inline markdown editing and single-section AI regeneration capabilities.
- **Modules:**
  - Multi-section blueprint generation engine (Section 1 through 23)
  - Sectional storage system (stores each section independently)
  - Blueprint workspace UI canvas with section navigation menu
  - Rich Markdown section view and inline editor
  - Targeted single-section AI regeneration control

---

### Phase 6: Blueprint Version Control & Diff Viewer

- **Objective:** Track historical revisions of blueprint sections and enable side-by-side version comparison and restoration.
- **Modules:**
  - Section snapshot versioning system (saves revision history on edits/regeneration)
  - Version history list view per section
  - Side-by-side visual diff viewer (highlights additions and deletions)
  - Version restore action (reverts section to any previous snapshot)
- **Expected Outcome:** Complete revision tracking for every blueprint section with visual diff comparison and instant rollback capabilities.

---

### Phase 7: Architectural Health Score & Rule Validator

- **Objective:** Evaluate the generated blueprint for technical completeness, consistency, and potential risks.
- **Modules:**
  - Heuristic architectural rule checker (validates cross-section compatibility)
  - AI logic consistency auditor (detects conflicts between requirements and design)
  - Health Score calculator (produces a 0 to 100 health index)
  - Health Score UI dashboard widget with color status (Green / Yellow / Red)
  - Remediation issue list with quick-fix recommendations
- **Expected Outcome:** An automated health check report rating the blueprint quality (0-100) and highlighting actionable flaws.

---

### Phase 8: What-If Simulation & Trade-off Engine

- **Objective:** Allow users to simulate architectural changes and evaluate structural impacts before finalizing plans.
- **Modules:**
  - Scenario simulation panel (e.g., change DB type, scale concurrency, alter security model)
  - Architectural delta analyzer (determines affected blueprint sections)
  - Cost and risk impact estimator
  - Side-by-side scenario comparison card (Baseline vs. Mutated architecture)
  - Trade-off explanation viewer (Pros, Cons, and Mitigation strategy)
- **Expected Outcome:** Interactive simulation feature showing how technical changes affect the system architecture, costs, and trade-offs.

---

### Phase 9: Selective Diagram Generator & Blueprint Export

- **Objective:** Synthesize visual UML diagrams and export the complete blueprint package.
- **Modules:**
  - Diagram DSL generator (Transforms blueprint JSON into Mermaid.js & PlantUML code)
  - Selective diagram picker (Architecture, Sequence, ER, Component, Class, Use Case diagrams)
  - Client-side SVG diagram renderer with pan and zoom controls
  - One-click diagram SVG/PNG export
  - Markdown blueprint package compiler (`ARCHITECT_BLUEPRINT.md` download)
- **Expected Outcome:** High-quality visual architecture diagrams rendered on screen, plus one-click export of the complete blueprint document.

---

## One-Page Development Milestone Roadmap

Below is the recommended sequential order for building **ArchitectIQ MVP**:

```
[START]
   │
   ├──▶ PHASE 1: Project Setup & Base Infrastructure
   │      └── Setup React UI, FastAPI Backend, Postgres & ChromaDB containers.
   │
   ├──▶ PHASE 2: Authentication & Project Workspace
   │      └── User Signup/Login + Project Creation Dashboard.
   │
   ├──▶ PHASE 3: Interactive Requirements Intake Engine
   │      └── High-level idea entry + AI Follow-up Questionnaire.
   │
   ├──▶ PHASE 4: RAG Knowledge Base & Retrieval Subsystem
   │      └── Index engineering patterns into ChromaDB + Semantic Search.
   │
   ├──▶ PHASE 5: Blueprint Generation & Editing Canvas
   │      └── AI generates 23 sections + Independent section editing & regeneration.
   │
   ├──▶ PHASE 6: Blueprint Version Control & Diff Viewer
   │      └── Snapshot history + Side-by-side visual diff comparison.
   │
   ├──▶ PHASE 7: Architectural Health Score & Rule Validator
   │      └── Rule checks + 0-100 Health Score Dashboard.
   │
   ├──▶ PHASE 8: What-If Simulation & Trade-off Engine
   │      └── Simulate tech stack / constraint changes + Trade-off matrix.
   │
   └──▶ PHASE 9: Selective Diagram Generator & Blueprint Export
          └── Render Mermaid/PlantUML SVG diagrams + Markdown file download.
   │
[MVP COMPLETE]
```

### Key Development Strategy Tips for Student / Copilot Workflow:
1. **Build Phase by Phase:** Finish and test one phase before starting the next.
2. **Keep Prompting Simple:** When using GitHub Copilot, prompt module by module (e.g., *"Build the intake questionnaire UI component"*).
3. **Use the Roadmap as a Checklist:** Check off each phase's "Expected Outcome" to confirm feature readiness.
