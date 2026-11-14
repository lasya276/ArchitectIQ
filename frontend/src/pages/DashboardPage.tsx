import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { StatusBadge } from '../components/ui/StatusBadge';
import { 
  Plus, 
  FolderKanban, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Clock, 
  ArrowRight,
  AlertCircle,
  FileCode
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { ProjectListItem } from '../api/types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    projects, 
    isLoading, 
    error, 
    updateProject, 
    deleteProject 
  } = useProjects();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');

  const [projectToEdit, setProjectToEdit] = useState<ProjectListItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [projectToDelete, setProjectToDelete] = useState<ProjectListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      p =>
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }, [projects, searchQuery]);

  // Most recent project for "Continue Editing"
  const mostRecentProject = useMemo(() => {
    if (projects.length === 0) return null;
    return [...projects].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0];
  }, [projects]);

  // Handle Edit/Rename Project
  const handleOpenEditModal = (project: ProjectListItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProjectToEdit(project);
    setEditTitle(project.title);
    setEditDescription(project.description || '');
    setUpdateError(null);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit) return;
    setUpdateError(null);

    if (!editTitle.trim()) {
      setUpdateError('Project name is required.');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProject(projectToEdit.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setProjectToEdit(null);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update project.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Project
  const handleOpenDeleteModal = (project: ProjectListItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProjectToDelete(project);
    setDeleteError(null);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Projects
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage your software architecture projects and system specifications.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              id="new-project-btn"
              onClick={() => navigate('/wizard')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Project
            </Button>
          </div>
        </div>

        {/* Continue Editing Banner (Compact & Sleek) */}
        {mostRecentProject && (
          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-900/50">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Recent Workspace
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-[11px] text-slate-400">
                    Updated {new Date(mostRecentProject.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {mostRecentProject.title}
                </h4>
              </div>
            </div>
            <Button
              id="continue-editing-btn"
              onClick={() => navigate(`/workspace/${mostRecentProject.id}`)}
              size="sm"
              variant="outline"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="shrink-0"
            >
              Open Workspace
            </Button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredProjects.length}</strong> of {projects.length} project(s)
          </div>

          <div className="w-full sm:w-64">
            <Input
              id="search-projects-input"
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5" />}
            />
          </div>
        </div>

        {/* Main Content Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" className="text-blue-600" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading your project workspaces...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-center">
            <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Unable to load projects</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 px-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
              {searchQuery ? 'No matching projects found' : 'No projects yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
              {searchQuery
                ? `No projects matching "${searchQuery}". Clear the search filter to see all projects.`
                : 'Get started by creating your first software planning project.'}
            </p>
            <div className="mt-4">
              {searchQuery ? (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                  Clear Search Filter
                </Button>
              ) : (
                <Button
                  id="empty-create-project-btn"
                  onClick={() => navigate('/wizard')}
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create First Project
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Structured Project Table */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4 sm:px-6">Project</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {filteredProjects.map(project => (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/workspace/${project.id}`)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Project Column */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <FolderKanban className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {project.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {project.description || 'No description provided.'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={project.status || 'draft'} size="sm" />
                      </td>

                      {/* Updated Column */}
                      <td className="py-3.5 px-4 hidden sm:table-cell whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`edit-project-${project.id}`}
                            onClick={e => handleOpenEditModal(project, e)}
                            title="Rename Project"
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-project-${project.id}`}
                            onClick={e => handleOpenDeleteModal(project, e)}
                            title="Delete Project"
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`open-workspace-${project.id}`}
                            onClick={() => navigate(`/workspace/${project.id}`)}
                            title="Open Workspace"
                            className="ml-1 px-2.5 py-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-medium text-xs inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Rename / Edit Project */}
      <Modal
        isOpen={!!projectToEdit}
        onClose={() => {
          if (!isUpdating) setProjectToEdit(null);
        }}
        title="Edit Project Details"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => setProjectToEdit(null)}
            >
              Cancel
            </Button>
            <Button
              id="confirm-edit-project-btn"
              size="sm"
              isLoading={isUpdating}
              onClick={handleUpdateProject}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateProject} className="space-y-4">
          {updateError && (
            <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{updateError}</span>
            </div>
          )}

          <Input
            id="edit-project-title-input"
            label="Project Name"
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              id="edit-project-desc-input"
              rows={3}
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Project Confirmation */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => {
          if (!isDeleting) setProjectToDelete(null);
        }}
        title="Confirm Project Deletion"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setProjectToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              id="confirm-delete-project-btn"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteProject}
            >
              Delete Project
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {deleteError && (
            <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{projectToDelete?.title}</strong>? All workspace specifications and architectural requirements will be permanently deleted.
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default DashboardPage;

