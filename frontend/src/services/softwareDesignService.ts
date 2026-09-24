import { apiClient } from '../api/client';
import {
  SoftwareDesign,
  SoftwareDesignGenerateRequest,
  SoftwareDesignVersionItem,
} from '../api/types';

export const softwareDesignService = {
  /**
   * Generate a new software design version from a specific Architecture Blueprint version.
   * The blueprintVersion must be the exact version the user was viewing when initiating generation.
   */
  async generateDesign(
    projectId: string,
    blueprintVersion: number
  ): Promise<SoftwareDesign> {
    const body: SoftwareDesignGenerateRequest = { blueprint_version: blueprintVersion };
    return apiClient<SoftwareDesign>(`/projects/${projectId}/software-design/generate`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * Fetch latest (or specific version) software design for a project.
   */
  async getDesign(projectId: string, version?: number): Promise<SoftwareDesign> {
    const url = version
      ? `/projects/${projectId}/software-design?version=${version}`
      : `/projects/${projectId}/software-design`;
    return apiClient<SoftwareDesign>(url, { method: 'GET' });
  },

  /**
   * Fetch list of all software design versions for a project.
   * Each item includes blueprint_version indicating which architecture it derived from.
   */
  async getDesignVersions(projectId: string): Promise<SoftwareDesignVersionItem[]> {
    return apiClient<SoftwareDesignVersionItem[]>(
      `/projects/${projectId}/software-design/versions`,
      { method: 'GET' }
    );
  },
};
