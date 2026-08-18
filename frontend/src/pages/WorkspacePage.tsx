import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { 
  ArrowLeft, 
  Save, 
  Check, 
  AlertCircle, 
  Eye, 
  Target, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Sparkles,
  LayoutGrid,
  CheckCircle2
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { questionnaireService } from '../services/questionnaireService';
import { blueprintService } from '../services/blueprintService';
import { Project, WizardAnswers } from '../api/types';
import { mapQuestionnaireToWorkspace } from '../utils/workspaceMapper';
import { Modal } from '../components/ui/Modal';

export const WorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');

  // Workspace Sections (7 sections embedded in workspace)
  const [vision, setVision] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [requirements, setRequirements] = useState('');
  const [constraints, setConstraints] = useState('');
  const [businessGoals, setBusinessGoals] = useState('');
  const [stakeholders, setStakeholders] = useState('');
  const [targetUsers, setTargetUsers] = useState('');

  // Snapshot of last saved values to detect unsaved changes
  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>({});

  // Blueprint status
  const [hasBlueprint, setHasBlueprint] = useState(false);
  const [blueprintVersion, setBlueprintVersion] = useState<number | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'all' | 'vision' | 'problem' | 'requirements' | 'constraints' | 'business' | 'stakeholders' | 'users'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Generation Modal States
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showRegenerateConfirmModal, setShowRegenerateConfirmModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Check if current form has unsaved modifications
  const hasUnsavedChanges = useCallback(() => {
    return (
      title !== (savedSnapshot.title ?? '') ||
      description !== (savedSnapshot.description ?? '') ||
      status !== (savedSnapshot.status ?? 'draft') ||
      vision !== (savedSnapshot.vision ?? '') ||
      problemStatement !== (savedSnapshot.problemStatement ?? '') ||
      requirements !== (savedSnapshot.requirements ?? '') ||
      constraints !== (savedSnapshot.constraints ?? '') ||
      businessGoals !== (savedSnapshot.businessGoals ?? '') ||
      stakeholders !== (savedSnapshot.stakeholders ?? '') ||
      targetUsers !== (savedSnapshot.targetUsers ?? '')
    );
  }, [
    title,
    description,
    status,
    vision,
    problemStatement,
    requirements,
    constraints,
    businessGoals,
    stakeholders,
    targetUsers,
    savedSnapshot,
  ]);

  // Load project by ID
  const fetchProjectDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [data, bpVersions] = await Promise.all([
        projectService.getProjectById(id),
        blueprintService.getBlueprintVersions(id).catch(() => []),
      ]);
      setProject(data);

      if (bpVersions && bpVersions.length > 0) {
        setHasBlueprint(true);
        setBlueprintVersion(bpVersions[0].version);
      } else {
        setHasBlueprint(false);
        setBlueprintVersion(null);
      }

      let questionnaireAnswers: WizardAnswers = {};
      try {
        const qData = await questionnaireService.getQuestionnaire(id);
        if (qData && qData.answers) {
          questionnaireAnswers = qData.answers;
        }
      } catch {
        // Questionnaire may not exist for projects created without wizard
      }

      const mapped = mapQuestionnaireToWorkspace(questionnaireAnswers, data.workspace);

      const resolvedTitle = data.title || questionnaireAnswers.project_name || '';
      const resolvedDesc = data.description || questionnaireAnswers.project_description || '';
      const resolvedStatus = data.status || 'draft';
      const resolvedVision = mapped.vision || '';
      const resolvedProblem = mapped.problem_statement || '';
      const resolvedReqs = mapped.requirements || '';
      const resolvedConstraints = mapped.constraints || '';
      const resolvedGoals = mapped.business_goals || '';
      const resolvedStakeholders = mapped.stakeholders || '';
      const resolvedUsers = mapped.target_users || '';

      setTitle(resolvedTitle);
      setDescription(resolvedDesc);
      setStatus(resolvedStatus);
      setVision(resolvedVision);
      setProblemStatement(resolvedProblem);
      setRequirements(resolvedReqs);
      setConstraints(resolvedConstraints);
      setBusinessGoals(resolvedGoals);
      setStakeholders(resolvedStakeholders);
      setTargetUsers(resolvedUsers);

      // Store saved snapshot
      setSavedSnapshot({
        title: resolvedTitle,
        description: resolvedDesc,
        status: resolvedStatus,
        vision: resolvedVision,
        problemStatement: resolvedProblem,
        requirements: resolvedReqs,
        constraints: resolvedConstraints,
        businessGoals: resolvedGoals,
        stakeholders: resolvedStakeholders,
        targetUsers: resolvedUsers,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectDetail();
  }, [fetchProjectDetail]);

  // Handle Save
  const handleSave = async (e?: React.FormEvent): Promise<boolean> => {
    if (e) e.preventDefault();
    if (!id) return false;

    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    if (!title.trim()) {
      setSaveErrorMessage('Project Name cannot be empty.');
      return false;
    }

    setIsSaving(true);
    try {
      const updated = await projectService.updateProject(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        workspace: {
          vision,
          problem_statement: problemStatement,
          requirements,
          constraints,
          business_goals: businessGoals,
          stakeholders,
          target_users: targetUsers,
        },
      });

      setProject(updated);
      setSavedSnapshot({
        title: title.trim(),
        description: description.trim(),
        status,
        vision,
        problemStatement,
        requirements,
        constraints,
        businessGoals,
        stakeholders,
        targetUsers,
      });

      setSaveSuccessMessage('Workspace changes saved successfully!');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
      return true;
    } catch (err: any) {
      setSaveErrorMessage(err.message || 'Failed to save workspace changes.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Architecture Generation flow
  const handleInitiateGeneration = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedModal(true);
      return;
    }
    if (hasBlueprint) {
      setShowRegenerateConfirmModal(true);
      return;
    }
    executeGeneration();
  };

  // Execute the actual blueprint generation API call with live progress
  const executeGeneration = async () => {
    if (!id) return;
    setIsGenerating(true);
    setGenerationError(null);
    setShowUnsavedModal(false);
    setShowRegenerateConfirmModal(false);
    setGenerationStep(1);

    try {
      // Step 1: Read workspace specifications
      await new Promise((r) => setTimeout(r, 400));
      setGenerationStep(2);

      // Step 2: Analyze requirements & constraints
      await new Promise((r) => setTimeout(r, 400));
      setGenerationStep(3);

      // Step 3: Call generation API
      await blueprintService.generateBlueprint(id, { increment_version: true });
      setGenerationStep(4);
      await new Promise((r) => setTimeout(r, 300));

      navigate(`/workspace/${id}/blueprint`);
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to generate architecture blueprint.');
      setIsGenerating(false);
    }
  };

  // Save workspace first, then proceed to generation
  const handleSaveAndGenerate = async () => {
    const saved = await handleSave();
    if (saved) {
      setShowUnsavedModal(false);
      if (hasBlueprint) {
        setShowRegenerateConfirmModal(true);
      } else {
        executeGeneration();
      }
    }
  };

  const sectionTabs = [
    { id: 'all', label: 'All Sections', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'vision', label: 'Vision', icon: <Eye className="w-4 h-4" /> },
    { id: 'problem', label: 'Problem Statement', icon: <Target className="w-4 h-4" /> },
    { id: 'requirements', label: 'Requirements', icon: <FileText className="w-4 h-4" /> },
    { id: 'constraints', label: 'Constraints', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'business', label: 'Business Goals', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'stakeholders', label: 'Stakeholders', icon: <Users className="w-4 h-4" /> },
    { id: 'users', label: 'Target Users', icon: <UserCheck className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" className="text-indigo-600" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading project workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center">
          <Card className="max-w-md mx-auto p-6">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Workspace Not Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">{error || 'Project does not exist or access was denied.'}</p>
            <Button size="sm" onClick={() => navigate('/dashboard')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Workspaces
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              id="back-to-dashboard-btn"
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Workspace Specification Editor
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                  <CheckCircle2 className="w-3 h-3" />
                  {status}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {title || 'Untitled Project'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              id="workspace-status-select"
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            <Button
              id="save-workspace-btn"
              onClick={() => handleSave()}
              isLoading={isSaving}
              variant="outline"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Workspace
            </Button>

            <Button
              id="generate-architecture-btn"
              onClick={handleInitiateGeneration}
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate Architecture
            </Button>
          </div>
        </div>

        {/* Notifications / Alerts */}
        {saveSuccessMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {saveErrorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveErrorMessage}</span>
          </div>
        )}

        {/* Workspace vs Blueprint Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Workspace Specification</span>
          </button>
          <button
            onClick={() => {
              if (hasBlueprint) {
                navigate(`/workspace/${id}/blueprint`);
              } else {
                handleInitiateGeneration();
              }
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Architecture Blueprint</span>
            {hasBlueprint && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                v{blueprintVersion}
              </span>
            )}
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80 scrollbar-none">
          {sectionTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Workspace Form / Editor Sections */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Project Name & Core Info */}
          {(activeTab === 'all' || activeTab === 'vision') && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sparkles className="w-4 h-4" />
                <span>1. Project Information & Vision</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Project Name *
                  </label>
                  <input
                    id="workspace-title-input"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Short Description
                  </label>
                  <input
                    id="workspace-description-input"
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="High-level project summary..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Vision Statement
                </label>
                <textarea
                  id="workspace-vision-input"
                  rows={4}
                  value={vision}
                  onChange={e => setVision(e.target.value)}
                  placeholder="Define the overarching vision, long-term impact, and core inspiration of the project..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </Card>
          )}

          {/* Section 2: Problem Statement */}
          {(activeTab === 'all' || activeTab === 'problem') && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                <Target className="w-4 h-4" />
                <span>2. Problem Statement</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Problem Description
                </label>
                <textarea
                  id="workspace-problem-input"
                  rows={4}
                  value={problemStatement}
                  onChange={e => setProblemStatement(e.target.value)}
                  placeholder="Detail the pain points, operational friction, or technical gaps this software solves..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </Card>
          )}

          {/* Section 3: Requirements */}
          {(activeTab === 'all' || activeTab === 'requirements') && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                <FileText className="w-4 h-4" />
                <span>3. Functional & Technical Requirements</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Requirements Specification
                </label>
                <textarea
                  id="workspace-requirements-input"
                  rows={6}
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  placeholder="List key functional capabilities, API endpoints, integration flows, and non-functional requirements..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </Card>
          )}

          {/* Section 4: Constraints */}
          {(activeTab === 'all' || activeTab === 'constraints') && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                <AlertTriangle className="w-4 h-4" />
                <span>4. Constraints & Boundaries</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Architectural Constraints
                </label>
                <textarea
                  id="workspace-constraints-input"
                  rows={4}
                  value={constraints}
                  onChange={e => setConstraints(e.target.value)}
                  placeholder="Specify technology stack restrictions, budget limitations, security compliance rules, latency bounds..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </Card>
          )}

          {/* Section 5: Business Goals */}
          {(activeTab === 'all' || activeTab === 'business') && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                <TrendingUp className="w-4 h-4" />
                <span>5. Business Goals & Key Results</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Business Objectives (OKRs / KPIs)
                </label>
                <textarea
                  id="workspace-goals-input"
                  rows={4}
                  value={businessGoals}
                  onChange={e => setBusinessGoals(e.target.value)}
                  placeholder="Outline measurable business goals, revenue targets, cost reduction metrics, or performance milestones..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </Card>
          )}

          {/* Section 6: Stakeholders */}
          {(activeTab === 'all' || activeTab === 'stakeholders') && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                <Users className="w-4 h-4" />
                <span>6. Stakeholders</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Stakeholders & Roles
                </label>
                <textarea
                  id="workspace-stakeholders-input"
                  rows={4}
                  value={stakeholders}
                  onChange={e => setStakeholders(e.target.value)}
                  placeholder="List executive sponsors, product owners, lead architects, compliance leads, and key team members..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </Card>
          )}

          {/* Section 7: Target Users */}
          {(activeTab === 'all' || activeTab === 'users') && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                <UserCheck className="w-4 h-4" />
                <span>7. Target Users & Personas</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Audience & User Personas
                </label>
                <textarea
                  id="workspace-users-input"
                  rows={4}
                  value={targetUsers}
                  onChange={e => setTargetUsers(e.target.value)}
                  placeholder="Define primary user segments, technical proficiency level, core usage patterns, and user access roles..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </Card>
          )}

          {/* Bottom Save Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              id="bottom-save-workspace-btn"
              type="submit"
              variant="outline"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save All Changes
            </Button>
            <Button
              id="bottom-generate-architecture-btn"
              type="button"
              size="sm"
              onClick={handleInitiateGeneration}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate Architecture Blueprint →
            </Button>
          </div>
        </form>

        {/* Unsaved Changes Confirmation Modal */}
        <Modal
          isOpen={showUnsavedModal}
          onClose={() => setShowUnsavedModal(false)}
          title="Save Workspace Before Generating Architecture"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You have unsaved changes in your Workspace Specification. To ensure your architecture blueprint is generated using the most up-to-date requirements, please save your changes before proceeding.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnsavedModal(false)}
              >
                Continue Editing
              </Button>
              <Button
                size="sm"
                isLoading={isSaving}
                onClick={handleSaveAndGenerate}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save & Generate Architecture
              </Button>
            </div>
          </div>
        </Modal>

        {/* Regenerate Confirmation Modal */}
        <Modal
          isOpen={showRegenerateConfirmModal}
          onClose={() => setShowRegenerateConfirmModal(false)}
          title="Generate Architecture Blueprint"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              An architecture blueprint (v{blueprintVersion}) already exists for this project. Generating architecture will create a new version (
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                v{(blueprintVersion ?? 1) + 1}
              </span>
              ) based on your latest Workspace Specification.
            </p>
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300">
              <p className="font-semibold">Version History Protection:</p>
              <p className="text-[11px] mt-0.5">
                Your existing blueprint versions will remain intact and selectable in the version history.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRegenerateConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={executeGeneration}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate Version v{(blueprintVersion ?? 1) + 1}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Generation Progress Modal */}
        <Modal
          isOpen={isGenerating}
          onClose={() => {}}
          title="Generating Architecture Blueprint"
        >
          <div className="space-y-4">
            {generationError ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                  {generationError}
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setIsGenerating(false)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                  <Spinner size="sm" />
                  <span>Synthesizing Architecture Blueprint...</span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                  <p className={generationStep >= 1 ? 'text-emerald-600 font-semibold' : ''}>
                    {generationStep > 1 ? '✓' : '→'} Reading workspace specifications & boundaries
                  </p>
                  <p className={generationStep >= 2 ? 'text-emerald-600 font-semibold' : ''}>
                    {generationStep > 2 ? '✓' : generationStep === 2 ? '→' : '○'} Analyzing requirements & component interactions
                  </p>
                  <p className={generationStep >= 3 ? 'text-emerald-600 font-semibold' : ''}>
                    {generationStep > 3 ? '✓' : generationStep === 3 ? '→' : '○'} Formulating technology stack & ADR decisions
                  </p>
                  <p className={generationStep >= 4 ? 'text-emerald-600 font-semibold' : ''}>
                    {generationStep === 4 ? '✓' : '○'} Persisting blueprint version
                  </p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default WorkspacePage;

