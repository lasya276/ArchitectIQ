import { apiClient } from '../api/client';
import { Questionnaire, QuestionnaireCreate, QuestionnaireUpdate } from '../api/types';

export const questionnaireService = {
  /**
   * Fetch existing questionnaire for a project.
   */
  async getQuestionnaire(projectId: string): Promise<Questionnaire> {
    return apiClient<Questionnaire>(`/projects/${projectId}/questionnaire`, {
      method: 'GET',
    });
  },

  /**
   * Create a new questionnaire for a project.
   */
  async createQuestionnaire(projectId: string, data: QuestionnaireCreate): Promise<Questionnaire> {
    return apiClient<Questionnaire>(`/projects/${projectId}/questionnaire`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update (or upsert) an existing questionnaire.
   */
  async updateQuestionnaire(projectId: string, data: QuestionnaireUpdate): Promise<Questionnaire> {
    return apiClient<Questionnaire>(`/projects/${projectId}/questionnaire`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Save answers — creates if not exists, updates if it does.
   */
  async saveAnswers(projectId: string, data: QuestionnaireUpdate): Promise<Questionnaire> {
    try {
      // Try to get existing first
      await questionnaireService.getQuestionnaire(projectId);
      // Exists — update
      return questionnaireService.updateQuestionnaire(projectId, data);
    } catch {
      // Does not exist — create
      return questionnaireService.createQuestionnaire(projectId, {
        answers: data.answers ?? {},
        status: data.status ?? 'completed',
      });
    }
  },
};
