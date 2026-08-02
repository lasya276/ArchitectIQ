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
