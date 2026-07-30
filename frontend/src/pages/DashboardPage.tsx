import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, FolderKanban, Sparkles, Layers, Activity } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-lg">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Sparkles className="w-3 h-3" /> Phase 1 Base Workspace Shell
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Software Planning Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Welcome to ArchitectIQ. Create a software project workspace to transform ideas into complete engineering blueprints.
            </p>
          </div>
          <div>
            <Button
              id="new-project-btn"
              onClick={() => setIsNewProjectModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create New Project
            </Button>
          </div>
        </div>

        {/* Workspace Summary Cards (UI Shell) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Projects</span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">0</h4>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Generated Blueprints</span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">0</h4>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg. Health Score</span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">-- / 100</h4>
            </div>
          </Card>
        </div>

        {/* Empty Workspace Placeholder Card */}
        <Card className="text-center py-16 px-4 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Active Planning Projects
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
            Your workspace is ready for project creation. In Phase 2, you will be able to initiate new planning sessions and execute requirement intake workflows.
          </p>
          <div className="mt-6">
            <Button
              id="empty-create-project-btn"
              onClick={() => setIsNewProjectModalOpen(true)}
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Initialize First Project
            </Button>
          </div>
        </Card>
      </div>

      {/* Demo Create Project Modal (UI Preview Only) */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Create Software Planning Project"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsNewProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setIsNewProjectModalOpen(false)}>
              Create Workspace (Phase 1 UI)
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Phase 1 UI Preview: Project creation logic will be fully integrated with backend storage in Phase 2.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              placeholder="e.g., E-Commerce Microservices Platform"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
