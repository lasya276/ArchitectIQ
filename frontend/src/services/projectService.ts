import { apiClient } from '../api/client';
import { Project, ProjectCreate, ProjectListItem, ProjectUpdate } from '../api/types';

export const projectService = {
  /**
   * Fetch all projects owned by currently authenticated user.
   */
  async getProjects(skip = 0, limit = 100): Promise<ProjectListItem[]> {
    return apiClient<ProjectListItem[]>(`/projects?skip=${skip}&limit=${limit}`, {
      method: 'GET',
    });
  },

  /**
   * Fetch detailed project and embedded workspace by project ID.
   */
  async getProjectById(id: string): Promise<Project> {
    return apiClient<Project>(`/projects/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new project workspace.
   */
  async createProject(data: ProjectCreate): Promise<Project> {
    return apiClient<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update project details and/or workspace sections.
   */
  async updateProject(id: string, data: ProjectUpdate): Promise<Project> {
    return apiClient<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete project by ID.
   */
  async deleteProject(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};
