import { apiClient } from '../api/client';
import {
  ArchitectureBlueprint,
  BlueprintGenerateRequest,
  BlueprintUpdateRequest,
  BlueprintVersionItem,
} from '../api/types';

export const blueprintService = {
  /**
   * Fetch latest (or specific version) architecture blueprint for a project.
   */
  async getBlueprint(projectId: string, version?: number): Promise<ArchitectureBlueprint> {
    const url = version
      ? `/projects/${projectId}/blueprint?version=${version}`
      : `/projects/${projectId}/blueprint`;
    return apiClient<ArchitectureBlueprint>(url, {
      method: 'GET',
    });
  },

  /**
   * Generate a new architecture blueprint version based on current Workspace Specifications.
   */
  async generateBlueprint(
    projectId: string,
    data?: BlueprintGenerateRequest
  ): Promise<ArchitectureBlueprint> {
    return apiClient<ArchitectureBlueprint>(`/projects/${projectId}/blueprint/generate`, {
      method: 'POST',
      body: JSON.stringify(data || { increment_version: true }),
    });
  },

  /**
   * Fetch list of available architecture blueprint versions for a project.
   */
  async getBlueprintVersions(projectId: string): Promise<BlueprintVersionItem[]> {
    return apiClient<BlueprintVersionItem[]>(`/projects/${projectId}/blueprint/versions`, {
      method: 'GET',
    });
  },

  /**
   * Save manual refinements or updates to a specific blueprint version.
   */
  async updateBlueprint(
    projectId: string,
    data: BlueprintUpdateRequest,
    version?: number
  ): Promise<ArchitectureBlueprint> {
    const url = version
      ? `/projects/${projectId}/blueprint?version=${version}`
      : `/projects/${projectId}/blueprint`;
    return apiClient<ArchitectureBlueprint>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
