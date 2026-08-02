import { useState, useEffect, useCallback } from 'react';
import { ProjectListItem, ProjectCreate, ProjectUpdate, Project } from '../api/types';
import { projectService } from '../services/projectService';

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (data: ProjectCreate): Promise<Project> => {
    const newProject = await projectService.createProject(data);
    await fetchProjects();
    return newProject;
  };

  const updateProject = async (id: string, data: ProjectUpdate): Promise<Project> => {
    const updated = await projectService.updateProject(id, data);
    await fetchProjects();
    return updated;
  };

  const deleteProject = async (id: string): Promise<void> => {
    await projectService.deleteProject(id);
    await fetchProjects();
  };

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};
