import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { MermaidDiagram } from '../components/ui/MermaidDiagram';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  ArrowLeft,
  Layers,
  Cpu,
  Database,
  Plug,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  GitMerge,
  Eye,
  RefreshCw,
  Download,
  Server,
  Lock,
  ChevronRight,
  FileText,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { blueprintService } from '../services/blueprintService';
import { exportService } from '../services/exportService';
import {
  Project,
  ArchitectureBlueprint,
  BlueprintVersionItem,
} from '../api/types';

export const BlueprintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [blueprint, setBlueprint] = useState<ArchitectureBlueprint | null>(null);
  const [versions, setVersions] = useState<BlueprintVersionItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Regeneration state
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateStep, setRegenerateStep] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Active section tab / jump
  const [activeSection, setActiveSection] = useState<string>('diagram');

  // Expanded ADR and Risk states (collapsed by default for clean document presentation)
  const [expandedDecisions, setExpandedDecisions] = useState<Record<number, boolean>>({});
  const [expandedRisks, setExpandedRisks] = useState<Record<number, boolean>>({});

  const toggleDecision = (idx: number) => {
    setExpandedDecisions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleRisk = (idx: number) => {
    setExpandedRisks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportVersion, setExportVersion] = useState<number>(1);
  const [exportFormat, setExportFormat] = useState<'docx' | 'pdf'>('docx');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleOpenExportModal = () => {
    setExportVersion(selectedVersion ?? blueprint?.version ?? (versions.length > 0 ? versions[0].version : 1));
    setExportError(null);
    setShowExportModal(true);
  };

  const handleExecuteExport = async () => {
    if (!id) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await exportService.exportBlueprint(id, exportVersion, exportFormat);
      setShowExportModal(false);
    } catch (err: any) {
      setExportError(err.message || 'Failed to export Architecture Blueprint document.');
    } finally {
      setIsExporting(false);
    }
  };

  // Load project, versions, and blueprint
  const fetchBlueprintData = useCallback(
    async (versionToFetch?: number) => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const [projData, versionsData] = await Promise.all([
          projectService.getProjectById(id),
          blueprintService.getBlueprintVersions(id).catch(() => []),
        ]);
        setProject(projData);
        setVersions(versionsData);

        const targetVer = versionToFetch ?? (versionsData.length > 0 ? versionsData[0].version : undefined);
        setSelectedVersion(targetVer ?? 1);

        const bpData = await blueprintService.getBlueprint(id, targetVer);
        setBlueprint(bpData);
      } catch (err: any) {
        setError(err.message || 'Failed to load architecture blueprint.');
      } finally {
        setIsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchBlueprintData();
  }, [fetchBlueprintData]);

  // Handle version change
  const handleSelectVersion = async (ver: number) => {
    if (!id || ver === selectedVersion) return;
    setSelectedVersion(ver);
    setIsLoading(true);
    setError(null);
    try {
      const bpData = await blueprintService.getBlueprint(id, ver);
      setBlueprint(bpData);
    } catch (err: any) {
      setError(err.message || `Failed to load blueprint version ${ver}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle regeneration
  const handleRegenerate = async () => {
    if (!id) return;
    setIsRegenerating(true);
    setGenerationError(null);
    setRegenerateStep(1);

    try {
      await new Promise((r) => setTimeout(r, 400));
      setRegenerateStep(2);

      await new Promise((r) => setTimeout(r, 400));
      setRegenerateStep(3);

      const newBp = await blueprintService.generateBlueprint(id, { increment_version: true });
      setRegenerateStep(4);
      await new Promise((r) => setTimeout(r, 300));

      setBlueprint(newBp);
      setSelectedVersion(newBp.version);

      const vers = await blueprintService.getBlueprintVersions(id).catch(() => []);
      setVersions(vers);

      setShowRegenerateModal(false);
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to regenerate architecture blueprint.');
    } finally {
      setIsRegenerating(false);
      setRegenerateStep(0);
    }
  };

  const navSections = [
    { id: 'diagram', label: 'Architecture Diagram', icon: <Workflow className="w-3.5 h-3.5" /> },
    { id: 'overview', label: 'Overview', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'tech-stack', label: 'Technology Stack', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'style', label: 'Style & Pattern', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'decisions', label: 'ADR Decisions', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
    { id: 'components', label: 'Components', icon: <Server className="w-3.5 h-3.5" /> },
    { id: 'relationships', label: 'Interactions', icon: <GitMerge className="w-3.5 h-3.5" /> },
    { id: 'data-arch', label: 'Data Architecture', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Plug className="w-3.5 h-3.5" /> },
    { id: 'security', label: 'Security & Quality', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'risks', label: 'Risks & Trade-offs', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" className="text-brand-600" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading Architecture Blueprint...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center max-w-md mx-auto">
          <div className="w-10 h-10 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 mx-auto flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Blueprint Not Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
            {error || 'No architecture blueprint has been generated yet for this project.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/workspace/${id}`)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Workspace
            </Button>
            <Button
              size="sm"
              onClick={() => handleRegenerate()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Generate Blueprint
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const sections = blueprint?.sections;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16">
        {/* Page Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <button
              id="back-to-workspace-btn"
              onClick={() => navigate(`/workspace/${id}`)}
              className="mt-1 p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Back to Workspace"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Architecture Blueprint
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                  v{blueprint?.version ?? 1}
                </span>
                <StatusBadge status={blueprint?.status || 'draft'} />
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mt-0.5">
                {project.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generated from project requirements and domain specifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Version Selector Dropdown */}
            {versions.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">Version:</span>
                <select
                  id="blueprint-version-select"
                  value={selectedVersion ?? 1}
                  onChange={(e) => handleSelectVersion(Number(e.target.value))}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {versions.map((v) => (
                    <option key={v.version} value={v.version}>
                      v{v.version} ({new Date(v.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              id="export-blueprint-btn"
              variant="outline"
              size="sm"
              onClick={handleOpenExportModal}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Button>

            <Button
              id="regenerate-blueprint-btn"
              variant="outline"
              size="sm"
              onClick={() => setShowRegenerateModal(true)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Regenerate
            </Button>

            <Button
              id="generate-software-design-btn"
              variant="primary"
              size="sm"
              onClick={() => navigate(`/workspace/${id}/software-design`, {
                state: { blueprintVersion: blueprint?.version ?? selectedVersion ?? 1 }
              })}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Generate Software Design
            </Button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => navigate(`/workspace/${id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Workspace Specification</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300"
          >
            <Workflow className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Architecture Blueprint</span>
            <span className="ml-1 text-[11px] opacity-75 font-semibold">
              v{blueprint?.version ?? 1}
            </span>
          </button>
          <button
            onClick={() => navigate(`/workspace/${id}/software-design`, {
              state: { blueprintVersion: blueprint?.version ?? selectedVersion ?? 1 }
            })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Software Design</span>
          </button>
        </div>

        {/* Quick Navigation Anchor Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800/80 scrollbar-none">
          {navSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${activeSection === sec.id
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </button>
          ))}
        </div>

        {sections && (
          <div className="pt-6 space-y-14">
            {/* HERO SECTION: Architecture Visualization Workspace (Contained Workspace Exception) */}
            <div id="diagram" className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    System Architecture
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight">
                    Component Boundary & Architecture Diagram
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                    {sections.visual_diagram.description || 'Top-level architectural component visualization and boundary mapping.'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {sections.visual_diagram.diagram_type}
                </span>
              </div>

              {/* Large Diagram Canvas Workspace */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-8 dark:border-slate-800 dark:bg-slate-950/60 shadow-sm">
                <MermaidDiagram
                  code={sections.visual_diagram.mermaid_code}
                  diagramIndex={0}
                />
              </div>
            </div>

            {/* Section 1: Executive Overview */}
            <section id="overview" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  01. Executive Overview
                </h3>
                <span className="text-xs font-medium text-slate-400">Grounded in Project Scope</span>
              </div>

              {/* Editorial 3-Column Scope Matrix without cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 py-3 border-y border-slate-200 dark:border-slate-800">
                <div className="sm:pr-8 py-2 sm:py-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Domain
                  </span>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                    {sections.overview.domain}
                  </p>
                </div>
                <div className="sm:px-8 py-2 sm:py-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Primary Focus
                  </span>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                    {sections.overview.primary_focus}
                  </p>
                </div>
                <div className="sm:pl-8 py-2 sm:py-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Scope Target
                  </span>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                    {sections.overview.scope}
                  </p>
                </div>
              </div>

              {/* Architecture Summary Document Flow */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Architecture Summary
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-w-4xl">
                  {sections.overview.summary}
                </p>
              </div>
            </section>

            {/* Section 2: Technology Stack & Ecosystem */}
            <section id="tech-stack" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  02. Technology Stack & Ecosystem
                </h3>
                <span className="text-xs font-medium text-slate-400">Selected Frameworks & Platforms</span>
              </div>

              {/* Clean Technical Table without Card Wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {[
                      { label: 'Frontend / Client', items: sections.tech_stack.frontend },
                      { label: 'API & Backend', items: sections.tech_stack.backend },
                      { label: 'Database & Storage', items: sections.tech_stack.database },
                      { label: 'DevOps & Cloud', items: sections.tech_stack.devops_infrastructure },
                      { label: 'External Services', items: sections.tech_stack.third_party_services },
                    ].filter((row) => row.items.length > 0).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 pr-8 font-semibold text-slate-800 dark:text-slate-200 w-1/4 align-top">
                          {row.label}
                        </td>
                        <td className="py-3.5">
                          <div className="flex flex-wrap gap-2">
                            {row.items.map((item, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Architecture Style & Patterns */}
            <section id="style" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  03. Architecture Style & Design Patterns
                </h3>
                <span className="text-xs font-medium text-slate-400">Structural Paradigm</span>
              </div>

              {/* Editorial Typography Layout */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Architectural Paradigm
                  </span>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {sections.architecture_style.style_name}
                  </h4>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 pt-1">
                    Pattern: <strong className="text-slate-900 dark:text-slate-200 font-semibold">{sections.architecture_style.pattern_type}</strong>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Justification &amp; Trade-off Context
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
                    {sections.architecture_style.justification}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Architecture Decision Records (ADR) */}
            <section id="decisions" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  04. Architecture Decision Records (ADR)
                </h3>
                <span className="text-xs font-medium text-slate-400">{sections.decisions_and_rationale.length} Documented Decisions</span>
              </div>

              {/* Accordion / Document Style with subtle horizontal dividers */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
                {sections.decisions_and_rationale.map((adr, idx) => {
                  const isExpanded = expandedDecisions[idx] ?? false;
                  return (
                    <div key={idx} className="py-3">
                      <button
                        type="button"
                        onClick={() => toggleDecision(idx)}
                        className="w-full flex items-center justify-between gap-4 text-left py-1 hover:text-brand-600 transition-colors group select-none"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400 shrink-0">
                            ADR-{String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {adr.decision}
                          </span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="pl-14 pr-4 pt-3 pb-2 space-y-3 text-xs">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Rationale:</span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">{adr.rationale}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Requirement Grounding:</span>
                            <p className="text-slate-500 dark:text-slate-400">{adr.grounded_requirement}</p>
                          </div>
                          {adr.alternatives_considered.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              <span className="font-medium text-slate-500 dark:text-slate-400 text-xs">Alternatives Rejected:</span>
                              {adr.alternatives_considered.map((alt, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 line-through dark:bg-slate-800 dark:text-slate-400"
                                >
                                  {alt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 5: System Components & Responsibilities */}
            <section id="components" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  05. System Components & Responsibilities
                </h3>
                <span className="text-xs font-medium text-slate-400">{sections.components.length} Core Modules</span>
              </div>

              {/* Numbered 2-Column Document List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                {sections.components.map((comp, idx) => (
                  <div key={idx} className="py-3 border-b border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                          {comp.name}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {comp.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
                      {comp.responsibility}
                    </p>
                    {comp.interfaces.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pl-7 pt-1">
                        <span className="text-[11px] text-slate-400">Interfaces:</span>
                        {comp.interfaces.map((intf, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          >
                            {intf}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6: Component Relationships */}
            <section id="relationships" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  06. Interaction & Communication Flows
                </h3>
                <span className="text-xs font-medium text-slate-400">Protocol & Channel Mapping</span>
              </div>

              {/* Clean Technical Table without Card Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-2.5 pr-4">Source</th>
                      <th className="py-2.5 pr-4">Target</th>
                      <th className="py-2.5 pr-4">Interaction Description</th>
                      <th className="py-2.5">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {sections.component_relationships.map((rel, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-200">
                          {rel.source}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-200">
                          {rel.target}
                        </td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                          {rel.interaction}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                            {rel.protocol}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 7: Data Architecture & Persistence */}
            <section id="data-arch" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  07. Data Architecture & Persistence Strategy
                </h3>
                <span className="text-xs font-medium text-slate-400">Storage & Flow</span>
              </div>

              {/* Editorial 2-Column Storage Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Storage Strategy & Model
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {sections.data_architecture.storage_strategy}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Target Data Stores
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {sections.data_architecture.data_stores.map((ds, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60"
                      >
                        {ds}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* End-to-End Data Flow */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  End-to-End Data Flow
                </span>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 leading-relaxed overflow-x-auto">
                  {sections.data_architecture.data_flow}
                </div>
              </div>
            </section>

            {/* Section 8: External Integrations */}
            <section id="integrations" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  08. External Integrations
                </h3>
                <span className="text-xs font-medium text-slate-400">{sections.integrations.length} Services</span>
              </div>

              {/* Technical Service Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-2.5 pr-6 w-1/4">Service Name</th>
                      <th className="py-2.5 pr-6 w-28">Protocol</th>
                      <th className="py-2.5">Purpose &amp; Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {sections.integrations.map((intg, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-3 pr-6 font-semibold text-slate-900 dark:text-white">
                          {intg.name}
                        </td>
                        <td className="py-3 pr-6">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                            {intg.protocol}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                          {intg.purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 9: Security & Quality Considerations */}
            <section id="security" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  09. Security & Quality Considerations
                </h3>
                <span className="text-xs font-medium text-slate-400">Non-Functional & Compliance</span>
              </div>

              {/* 3 Editorial Columns with subtle dividers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Security Controls
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {sections.security_and_quality.security_controls.map((ctrl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">—</span>
                        <span className="leading-relaxed">{ctrl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:pl-8 space-y-3 pt-4 md:pt-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    Quality Attributes
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {sections.security_and_quality.quality_attributes.map((qa, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">—</span>
                        <span className="leading-relaxed">{qa}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:pl-8 space-y-3 pt-4 md:pt-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                    <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                    Compliance Standards
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sections.security_and_quality.compliance.map((cmp, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60"
                      >
                        {cmp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: Risks & Trade-offs */}
            <section id="risks" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  10. Risks & Architectural Trade-offs
                </h3>
                <span className="text-xs font-medium text-slate-400">Mitigations & Balances</span>
              </div>

              {/* Accordion Document Rows matching ADR pattern */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
                {sections.risks_and_tradeoffs.map((rk, idx) => {
                  const isExpanded = expandedRisks[idx] ?? false;
                  return (
                    <div key={idx} className="py-3">
                      <button
                        type="button"
                        onClick={() => toggleRisk(idx)}
                        className="w-full flex items-center justify-between gap-4 text-left py-1 hover:text-amber-600 transition-colors group select-none"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                            RISK-{String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {rk.risk}
                          </span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="pl-14 pr-4 pt-3 pb-2 space-y-3 text-xs">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                              System Impact:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                              {rk.impact}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                              Mitigation Strategy:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                              {rk.mitigation}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                              Trade-off:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                              {rk.tradeoff}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* Regenerate Confirmation Modal */}
        <Modal
          isOpen={showRegenerateModal}
          onClose={() => !isRegenerating && setShowRegenerateModal(false)}
          title="Regenerate Architecture Blueprint"
        >
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <p className="leading-relaxed">
              Synthesize a new architecture blueprint version (
              <strong className="text-brand-600 dark:text-brand-400">
                v{(versions.length > 0 ? versions[0].version : 1) + 1}
              </strong>
              ) based on your current workspace specifications.
            </p>

            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-medium text-slate-900 dark:text-slate-200">Version History:</p>
              <p className="text-[11px]">
                Your previous blueprint versions (v1..v{blueprint?.version}) will remain preserved and selectable.
              </p>
            </div>

            {generationError && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400">
                {generationError}
              </div>
            )}

            {isRegenerating ? (
              <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-brand-600 dark:text-brand-400">
                  <Spinner size="sm" />
                  <span>Synthesizing Architecture Blueprint...</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                  <p className={regenerateStep >= 1 ? 'text-emerald-600 font-semibold dark:text-emerald-400' : ''}>
                    {regenerateStep > 1 ? '✓' : '→'} Reading workspace specifications & boundaries
                  </p>
                  <p className={regenerateStep >= 2 ? 'text-emerald-600 font-semibold dark:text-emerald-400' : ''}>
                    {regenerateStep > 2 ? '✓' : regenerateStep === 2 ? '→' : '○'} Analyzing requirements & component interactions
                  </p>
                  <p className={regenerateStep >= 3 ? 'text-emerald-600 font-semibold dark:text-emerald-400' : ''}>
                    {regenerateStep > 3 ? '✓' : regenerateStep === 3 ? '→' : '○'} Formulating technology stack & ADR decisions
                  </p>
                  <p className={regenerateStep >= 4 ? 'text-emerald-600 font-semibold dark:text-emerald-400' : ''}>
                    {regenerateStep === 4 ? '✓' : '○'} Persisting new blueprint version
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRegenerateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleRegenerate}
                >
                  Generate Version v{(versions.length > 0 ? versions[0].version : 1) + 1}
                </Button>
              </div>
            )}
          </div>
        </Modal>

        {/* Export Architecture Blueprint Modal */}
        <Modal
          isOpen={showExportModal}
          onClose={() => !isExporting && setShowExportModal(false)}
          title="Export Architecture Blueprint"
        >
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Export an authoritative, implementation-ready document for academic reviews, engineering handovers, and technical presentations.
            </p>

            {/* Export Scope: Blueprint Only */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Export Scope
              </label>
              <div className="p-2.5 rounded-md border border-brand-200 dark:border-brand-900/40 bg-brand-50/50 dark:bg-brand-950/20 text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span className="font-medium text-xs">Architecture Blueprint Only</span>
                <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">Active Page</span>
              </div>
            </div>

            {/* Blueprint Version Selector */}
            <div className="space-y-1.5">
              <label htmlFor="export-blueprint-version" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Blueprint Version
              </label>
              <select
                id="export-blueprint-version"
                value={exportVersion}
                onChange={(e) => setExportVersion(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {versions.map((v) => (
                  <option key={v.version} value={v.version}>
                    Version {v.version} ({new Date(v.created_at).toLocaleDateString()}) {v.version === selectedVersion ? '— Current' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="select-format-docx"
                  onClick={() => setExportFormat('docx')}
                  className={`flex items-center gap-2.5 p-3 rounded-md border text-left transition-colors ${
                    exportFormat === 'docx'
                      ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30 text-brand-900 dark:text-brand-100 ring-1 ring-brand-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                    W
                  </div>
                  <div>
                    <div className="font-semibold text-xs">Word Document</div>
                    <div className="text-[10px] text-slate-400">Editable .docx format</div>
                  </div>
                </button>

                <button
                  type="button"
                  id="select-format-pdf"
                  onClick={() => setExportFormat('pdf')}
                  className={`flex items-center gap-2.5 p-3 rounded-md border text-left transition-colors ${
                    exportFormat === 'pdf'
                      ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30 text-brand-900 dark:text-brand-100 ring-1 ring-brand-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <div className="font-semibold text-xs">PDF Document</div>
                    <div className="text-[10px] text-slate-400">High-resolution .pdf</div>
                  </div>
                </button>
              </div>
            </div>

            {exportError && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 text-xs">
                {exportError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting}
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </Button>
              <Button
                id="confirm-export-blueprint-btn"
                size="sm"
                isLoading={isExporting}
                onClick={handleExecuteExport}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export Document
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default BlueprintPage;
