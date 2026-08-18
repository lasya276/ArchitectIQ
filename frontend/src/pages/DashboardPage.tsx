import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { 
  Plus, 
  FolderKanban, 
  Sparkles, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Clock, 
  ArrowRight,
  AlertCircle,
  FileCode,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { ProjectListItem } from '../api/types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-lg">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> ArchitectIQ Planning Platform
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name || 'Architect'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Logged in as <span className="font-semibold text-indigo-300">{user?.email}</span>. Manage your architecture blueprints and project specifications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              id="new-project-btn"
              onClick={() => navigate('/wizard')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Project
            </Button>
          </div>
        </div>

        {/* Continue Editing Section (If user has projects) */}
        {mostRecentProject && (
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 dark:bg-indigo-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Continue Editing Most Recent Project
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {mostRecentProject.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {mostRecentProject.description || 'No description provided.'}
                </p>
              </div>
            </div>
            <Button
              id="continue-editing-btn"
              onClick={() => navigate(`/workspace/${mostRecentProject.id}`)}
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Workspace
            </Button>
          </div>
        )}

        {/* Dashboard Control Bar: Search & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Projects & Workspaces
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredProjects.length} of {projects.length} project(s)
            </p>
          </div>

          <div className="w-full sm:w-72">
            <Input
              id="search-projects-input"
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Main Projects Section */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" className="text-indigo-600" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading your project workspaces...</p>
          </div>
        ) : error ? (
          <Card className="text-center py-12 px-4 border-rose-500/30">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Unable to load projects</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">{error}</p>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card className="text-center py-16 px-4 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
              <FolderKanban className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {searchQuery ? 'No matching projects found' : 'No Active Planning Projects'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
              {searchQuery
                ? `No projects matching "${searchQuery}". Try a different search phrase or clear the filter.`
                : 'Your workspace is empty. Create your first software planning project to start organizing architectural specifications.'}
            </p>
            <div className="mt-6">
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
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <Card
                key={project.id}
                className="group relative flex flex-col justify-between hover:border-indigo-500/50 hover:shadow-xl transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/workspace/${project.id}`)}
              >
                <div>
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                      <CheckCircle2 className="w-3 h-3" />
                      {project.status || 'draft'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {project.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 min-h-[2.5rem]">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Card Footer & Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      id={`edit-project-${project.id}`}
                      onClick={e => handleOpenEditModal(project, e)}
                      title="Rename Project"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-project-${project.id}`}
                      onClick={e => handleOpenDeleteModal(project, e)}
                      title="Delete Project"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`open-workspace-${project.id}`}
                      onClick={() => navigate(`/workspace/${project.id}`)}
                      title="Open Workspace"
                      className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center gap-1 font-medium text-[11px]"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Activity Timeline Section */}
        {projects.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Recent Workspace Activity
            </h3>
            <Card className="divide-y divide-slate-100 dark:divide-slate-800">
              {projects.slice(0, 5).map(p => (
                <div
                  key={`act-${p.id}`}
                  className="py-3 px-1 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {p.title}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 ml-2">
                        Updated specification content
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(p.updated_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </Card>
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
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
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
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{projectToDelete?.title}</strong>? This action will permanently remove all workspace sections and architectural requirements associated with this project.
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default DashboardPage;
