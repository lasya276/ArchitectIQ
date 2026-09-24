/**
 * Data Models & Schemas matching ArchitectIQ FastAPI Backend
 */

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserAuthResponse {
  user: User;
  message: string;
}

export interface Workspace {
  id: string;
  project_id: string;
  vision: string;
  problem_statement: string;
  requirements: string;
  constraints: string;
  business_goals: string;
  stakeholders: string;
  target_users: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceUpdate {
  vision?: string;
  problem_statement?: string;
  requirements?: string;
  constraints?: string;
  business_goals?: string;
  stakeholders?: string;
  target_users?: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  workspace?: Workspace | null;
}

export interface ProjectListItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  title: string;
  description?: string | null;
  status?: string;
}

export interface ProjectUpdate {
  title?: string;
  description?: string | null;
  status?: string;
  workspace?: WorkspaceUpdate;
}

// ─── Wizard / Questionnaire Types ───────────────────────────────────────────

export interface FunctionalRequirement {
  id: string;
  text: string;
  category: string;
  priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
}

export interface WizardAnswers {
  // Step 1
  project_name?: string;
  project_description?: string;
  project_category?: string;

  // Step 2
  industry?: string;

  // Step 3
  target_users?: string[];

  // Step 4
  business_objectives?: string[];

  // Step 5
  platforms?: string[];

  // Step 6
  expected_users?: string;
  timeline?: string;
  budget?: string;
  team_size?: string;
  priority?: string;
  business_size?: string;

  // Step 7
  functional_requirements?: FunctionalRequirement[];

  // Step 8
  non_functional_requirements?: string[];

  // Step 9
  integrations?: string[];

  // Step 10
  business_goals?: string;
  constraints?: string;
  special_requirements?: string;
  notes?: string;
}

export interface Questionnaire {
  id: string;
  project_id: string;
  answers: WizardAnswers;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireCreate {
  answers: WizardAnswers;
  status?: string;
}

export interface QuestionnaireUpdate {
  answers?: WizardAnswers;
  status?: string;
}

// ─── Architecture Blueprint Types ───────────────────────────────────────────

export interface OverviewSection {
  summary: string;
  domain: string;
  primary_focus: string;
  scope: string;
}

export interface ArchitectureStyleSection {
  style_name: string;
  pattern_type: string;
  justification: string;
}

export interface TechStackSection {
  frontend: string[];
  backend: string[];
  database: string[];
  devops_infrastructure: string[];
  third_party_services: string[];
}

export interface ComponentItem {
  name: string;
  type: string;
  responsibility: string;
  interfaces: string[];
}

export interface RelationshipItem {
  source: string;
  target: string;
  interaction: string;
  protocol: string;
}

export interface DataArchitectureSection {
  storage_strategy: string;
  data_stores: string[];
  data_flow: string;
}

export interface IntegrationItem {
  name: string;
  purpose: string;
  protocol: string;
}

export interface SecurityQualitySection {
  security_controls: string[];
  quality_attributes: string[];
  compliance: string[];
}

export interface DecisionItem {
  decision: string;
  rationale: string;
  grounded_requirement: string;
  alternatives_considered: string[];
}

export interface RiskItem {
  risk: string;
  impact: string;
  mitigation: string;
  tradeoff: string;
}

export interface VisualDiagramSection {
  diagram_type: string;
  mermaid_code: string;
  description: string;
}

export interface BlueprintSections {
  overview: OverviewSection;
  architecture_style: ArchitectureStyleSection;
  tech_stack: TechStackSection;
  components: ComponentItem[];
  component_relationships: RelationshipItem[];
  data_architecture: DataArchitectureSection;
  integrations: IntegrationItem[];
  security_and_quality: SecurityQualitySection;
  decisions_and_rationale: DecisionItem[];
  risks_and_tradeoffs: RiskItem[];
  visual_diagram: VisualDiagramSection;
}

export interface ArchitectureBlueprint {
  id: string;
  project_id: string;
  version: number;
  status: string;
  sections: BlueprintSections;
  created_at: string;
  updated_at: string;
}

export interface BlueprintVersionItem {
  version: number;
  status: string;
  created_at: string;
}

export interface BlueprintGenerateRequest {
  increment_version?: boolean;
}

export interface BlueprintUpdateRequest {
  sections: BlueprintSections | Record<string, any>;
}

// ─── Software Design Types ───────────────────────────────────────────────────

export interface DesignOverview {
  design_approach: string;
  application_type: string;
  architectural_style_alignment: string;
  core_modules: string[];
  primary_technologies: string[];
  database_approach: string;
  key_design_considerations: string[];
}

export interface HLDComponent {
  name: string;
  layer: string;
  responsibility: string;
  key_interactions: string[];
  technology: string;
}

export interface HighLevelDesign {
  system_overview: string;
  components: HLDComponent[];
  interaction_summary: string;
}

export interface LLDModule {
  name: string;
  module_type: string;
  responsibility: string;
  key_methods: string[];
  dependencies: string[];
  design_pattern: string;
}

export interface LowLevelDesign {
  design_patterns_applied: string[];
  modules: LLDModule[];
  error_handling_strategy: string;
  cross_cutting_concerns: string[];
}

export interface TechEntry {
  layer: string;
  technology: string;
  purpose: string;
  justification: string;
}

export interface TechStackDesign {
  technologies: TechEntry[];
  version_strategy: string;
  compatibility_notes: string;
}

export interface FolderStructure {
  structure_tree: string;
  description: string;
  key_directories: string[];
  naming_conventions: string;
}

export interface DBField {
  name: string;
  data_type: string;
  constraints: string;
  description: string;
}

export interface DBEntity {
  name: string;
  entity_type: string;
  description: string;
  fields: DBField[];
  relationships: string[];
  indexes: string[];
}

export interface DatabaseDesign {
  db_technology: string;
  schema_strategy: string;
  entities: DBEntity[];
  migration_strategy: string;
  data_integrity_notes: string;
}

export interface APIEndpoint {
  method: string;
  path: string;
  purpose: string;
  request_body: string;
  response_shape: string;
  auth_required: boolean;
  status_codes: string[];
}

export interface ApiSpecs {
  base_url: string;
  auth_mechanism: string;
  versioning_strategy: string;
  endpoints: APIEndpoint[];
  rate_limiting: string;
  error_response_format: string;
}

export interface DesignDiagram {
  diagram_type: string;
  title: string;
  mermaid_code: string;
  description: string;
}

export interface DiagramsSection {
  // ── New fixed-contract format (generated after schema fix) ──────────────
  er_diagram?: DesignDiagram;
  class_diagram?: DesignDiagram;
  component_diagram?: DesignDiagram;
  // ── Legacy format (designs stored before the schema fix) ─────────────────
  diagrams?: DesignDiagram[];
}

/**
 * Normalizes a DiagramsSection (either new named-slot or legacy array format)
 * into a canonical ordered array: [ER Diagram, Class Diagram, Component Diagram].
 * This ensures consistent rendering regardless of which schema version was used
 * to generate the stored design.
 */
export function normalizeDiagrams(ds: DiagramsSection): DesignDiagram[] {
  // New fixed-contract format: named slots
  if (ds.er_diagram || ds.class_diagram || ds.component_diagram) {
    const result: DesignDiagram[] = [];
    if (ds.er_diagram) result.push(ds.er_diagram);
    if (ds.class_diagram) result.push(ds.class_diagram);
    if (ds.component_diagram) result.push(ds.component_diagram);
    return result;
  }
  // Legacy array format: return as-is
  if (ds.diagrams && ds.diagrams.length > 0) {
    return ds.diagrams;
  }
  return [];
}

export interface SoftwareDesignSections {
  overview: DesignOverview;
  high_level_design: HighLevelDesign;
  low_level_design: LowLevelDesign;
  technology_stack: TechStackDesign;
  folder_structure: FolderStructure;
  database_design: DatabaseDesign;
  api_specifications: ApiSpecs;
  diagrams: DiagramsSection;
}

export interface SoftwareDesign {
  id: string;
  project_id: string;
  blueprint_version: number;
  version: number;
  status: string;
  sections: SoftwareDesignSections;
  created_at: string;
  updated_at: string;
}

export interface SoftwareDesignVersionItem {
  version: number;
  blueprint_version: number;
  status: string;
  created_at: string;
}

export interface SoftwareDesignGenerateRequest {
  blueprint_version: number;
}
