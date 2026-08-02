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

