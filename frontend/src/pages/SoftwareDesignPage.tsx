import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  AlertTriangle,
  GitMerge,
  Eye,
  RefreshCw,
  Download,
  Code2,
  FileText,
  Workflow,
  ChevronDown,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { blueprintService } from '../services/blueprintService';
import { softwareDesignService } from '../services/softwareDesignService';
import { exportService } from '../services/exportService';
import {
  Project,
  SoftwareDesign,
  SoftwareDesignVersionItem,
  BlueprintVersionItem,
  normalizeDiagrams,
} from '../api/types';

export const SoftwareDesignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Blueprint version passed from BlueprintPage via navigation state
  const navState = (location.state as { blueprintVersion?: number } | null) || {};
  const [activeBlueprintVersion, setActiveBlueprintVersion] = useState<number>(
    navState.blueprintVersion ?? 1
  );

  const [project, setProject] = useState<Project | null>(null);
  const [softwareDesign, setSoftwareDesign] = useState<SoftwareDesign | null>(null);
  const [designVersions, setDesignVersions] = useState<SoftwareDesignVersionItem[]>([]);
  const [selectedDesignVersion, setSelectedDesignVersion] = useState<number | null>(null);
  const [blueprintVersions, setBlueprintVersions] = useState<BlueprintVersionItem[]>([]);
  const [, setLatestArchVersion] = useState<number>(activeBlueprintVersion);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<string>('diagrams');
  const [activeDiagramTab, setActiveDiagramTab] = useState<number>(0); // 0: ER Diagram, 1: Class Diagram, 2: Component Diagram
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<'blueprint' | 'software_design' | 'documentation'>('software_design');
  const [exportBpVersion, setExportBpVersion] = useState<number>(1);
  const [exportSdVersion, setExportSdVersion] = useState<number>(1);
  const [exportFormat, setExportFormat] = useState<'docx' | 'pdf'>('docx');
  const [acknowledgedMismatch, setAcknowledgedMismatch] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleOpenExportModal = () => {
    setExportBpVersion(activeBlueprintVersion || (blueprintVersions.length > 0 ? blueprintVersions[0].version : 1));
    setExportSdVersion(selectedDesignVersion ?? softwareDesign?.version ?? (designVersions.length > 0 ? designVersions[0].version : 1));
    setExportScope('software_design');
    setAcknowledgedMismatch(false);
    setExportError(null);
    setShowExportModal(true);
  };

  const handleExecuteExport = async () => {
    if (!id) return;
    setIsExporting(true);
    setExportError(null);
    try {
      if (exportScope === 'blueprint') {
        await exportService.exportBlueprint(id, exportBpVersion, exportFormat);
      } else if (exportScope === 'software_design') {
        await exportService.exportSoftwareDesign(id, exportSdVersion, exportFormat);
      } else {
        await exportService.exportDocumentation(id, exportBpVersion, exportSdVersion, exportFormat);
      }
      setShowExportModal(false);
    } catch (err: any) {
      setExportError(err.message || 'Failed to export documentation.');
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch project, blueprint metadata, and existing software design
  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [projData, bpVersionsData] = await Promise.all([
        projectService.getProjectById(id),
        blueprintService.getBlueprintVersions(id).catch(() => []),
      ]);
      setProject(projData);
      setBlueprintVersions(bpVersionsData);

      if (bpVersionsData.length > 0) {
        setLatestArchVersion(bpVersionsData[0].version);
        if (!navState.blueprintVersion) {
          setActiveBlueprintVersion(bpVersionsData[0].version);
        }
      }

      const [existingDesign, existingVersions] = await Promise.all([
        softwareDesignService.getDesign(id).catch(() => null),
        softwareDesignService.getDesignVersions(id).catch(() => []),
      ]);

      if (existingDesign) {
        setSoftwareDesign(existingDesign);
        setSelectedDesignVersion(existingDesign.version);
        if (!navState.blueprintVersion) {
          setActiveBlueprintVersion(existingDesign.blueprint_version);
        }
      }
      setDesignVersions(existingVersions);
    } catch (err: any) {
      setError(err.message || 'Failed to load project design data.');
    } finally {
      setIsLoading(false);
    }
  }, [id, navState.blueprintVersion]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate new software design
  const handleGenerate = async () => {
    if (!id) return;
    setIsGenerating(true);
    setGenerationError(null);
    setShowRegenerateModal(false);
    try {
      const newDesign = await softwareDesignService.generateDesign(id, activeBlueprintVersion);
      setSoftwareDesign(newDesign);
      setSelectedDesignVersion(newDesign.version);
      const versions = await softwareDesignService.getDesignVersions(id).catch(() => []);
      setDesignVersions(versions);
      setActiveBlueprintVersion(newDesign.blueprint_version);
    } catch (err: any) {
      setGenerationError(
        err.message || 'Software design generation failed. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Switch design version
  const handleVersionSwitch = async (version: number) => {
    if (!id || version === selectedDesignVersion) return;
    try {
      const design = await softwareDesignService.getDesign(id, version);
      setSoftwareDesign(design);
      setSelectedDesignVersion(version);
      setActiveBlueprintVersion(design.blueprint_version);
    } catch {
      // Keep existing design on error
    }
  };

  const navSections = [
    { id: 'diagrams', label: 'Diagrams Workspace', icon: <GitMerge className="w-3.5 h-3.5" /> },
    { id: 'overview', label: 'Overview', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'high-level', label: 'High-Level Design', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'low-level', label: 'Low-Level Design', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'tech-stack', label: 'Tech Stack', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'folder-structure', label: 'Folder Structure', icon: <Workflow className="w-3.5 h-3.5" /> },
    { id: 'database-design', label: 'Database Design', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'api-specs', label: 'API Specifications', icon: <Plug className="w-3.5 h-3.5" /> },
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
            Loading Software Design workspace...
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
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Project Not Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
            {error || 'Failed to load details for this workspace.'}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const hasDesign = !!softwareDesign;
  const sections = softwareDesign?.sections;
  const normalizedDiagramList = sections ? normalizeDiagrams(sections.diagrams) : [];

  const diagramTabs = [
    { label: 'ER Diagram', type: 'er' },
    { label: 'Class Diagram', type: 'class' },
    { label: 'Component Diagram', type: 'component' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <button
              id="back-to-blueprint-btn"
              onClick={() => navigate(`/workspace/${id}/blueprint`)}
              className="mt-1 p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Back to Architecture Blueprint"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Software Design Workspace
                </span>
                {hasDesign ? (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      v{softwareDesign.version}
                    </span>
                    <StatusBadge status={softwareDesign.status || 'completed'} />
                    <span className="text-xs text-slate-400">
                      (from Blueprint v{softwareDesign.blueprint_version})
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-medium text-slate-500">Not Generated</span>
                  </>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mt-0.5">
                {project.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Version selector */}
            {designVersions.length > 1 && (
              <div className="relative">
                <select
                  id="design-version-select"
                  value={selectedDesignVersion ?? ''}
                  onChange={(e) => handleVersionSwitch(Number(e.target.value))}
                  className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {designVersions.map((v) => (
                    <option key={v.version} value={v.version}>
                      Design v{v.version} · Blueprint v{v.blueprint_version}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            )}

            {hasDesign && (
              <Button
                id="export-design-btn"
                variant="outline"
                size="sm"
                onClick={handleOpenExportModal}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export
              </Button>
            )}

            <Button
              id="regenerate-design-btn"
              variant={hasDesign ? 'outline' : 'primary'}
              size="sm"
              disabled={isGenerating}
              onClick={() => (hasDesign ? setShowRegenerateModal(true) : handleGenerate())}
              leftIcon={
                isGenerating ? (
                  <Spinner size="sm" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )
              }
            >
              {isGenerating
                ? 'Generating Design...'
                : hasDesign
                ? 'Regenerate'
                : 'Generate Software Design'}
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
            onClick={() => navigate(`/workspace/${id}/blueprint`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Workflow className="w-3.5 h-3.5 text-slate-400" />
            <span>Architecture Blueprint</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300"
          >
            <Layers className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Software Design</span>
            {hasDesign && (
              <span className="ml-1 text-[11px] opacity-75 font-semibold">
                v{softwareDesign.version}
              </span>
            )}
          </button>
        </div>

        {/* Generating Banner */}
        {isGenerating && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
            <Spinner size="sm" className="text-brand-600" />
            <div className="text-xs">
              <p className="font-semibold text-slate-900 dark:text-white">Synthesizing Detailed Software Design...</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Analyzing Architecture Blueprint v{activeBlueprintVersion} and generating low-level class models, ER diagrams, and endpoint contracts.
              </p>
            </div>
          </div>
        )}

        {/* Generation Error Banner */}
        {generationError && (
          <div className="flex items-start gap-3 p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Generation Failed</p>
              <p className="text-[11px] mt-0.5">{generationError}</p>
              <button
                onClick={handleGenerate}
                className="mt-2 text-[11px] underline underline-offset-2 hover:no-underline font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Quick Navigation Anchor Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800/80 scrollbar-none">
          {navSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeSection === sec.id
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </button>
          ))}
        </div>

        {/* Main Workspace Body */}
        {hasDesign && sections ? (
          <div className="space-y-10">
            {/* HERO SECTION: Tabbed Diagrams Workspace (ER, Class, Component in exact order) */}
            <div id="diagrams" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Architectural & Engineering Diagrams
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Interactive engineering models derived from component interfaces and data storage specifications.
                  </p>
                </div>
              </div>

              {/* Exact 3 Tabs: ER Diagram | Class Diagram | Component Diagram */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1">
                {diagramTabs.map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDiagramTab(idx)}
                    className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                      activeDiagramTab === idx
                        ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {idx + 1}. {tab.label}
                  </button>
                ))}
              </div>

              {/* ONE LARGE DIAGRAM WORKSPACE */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
                {normalizedDiagramList[activeDiagramTab] ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {normalizedDiagramList[activeDiagramTab].title}
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {normalizedDiagramList[activeDiagramTab].diagram_type}
                      </span>
                    </div>

                    {normalizedDiagramList[activeDiagramTab].description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {normalizedDiagramList[activeDiagramTab].description}
                      </p>
                    )}

                    <div className="pt-2">
                      <MermaidDiagram
                        code={normalizedDiagramList[activeDiagramTab].mermaid_code}
                        diagramIndex={activeDiagramTab}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                    No diagram generated for this tab yet.
                  </div>
                )}
              </div>
            </div>

            {/* Section 1: Overview */}
            <section id="overview" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  01. Design Overview
                </h3>
                <span className="text-xs font-medium text-slate-400">Foundational Principles</span>
              </div>

              {/* 4-Column Editorial Grid without Card Backgrounds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 py-3 border-y border-slate-200 dark:border-slate-800">
                <div className="sm:pr-6 py-2 sm:py-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Design Approach
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {sections.overview.design_approach}
                  </p>
                </div>
                <div className="sm:px-6 py-2 sm:py-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Application Type
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {sections.overview.application_type}
                  </p>
                </div>
                <div className="sm:px-6 py-2 sm:py-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Architecture Alignment
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {sections.overview.architectural_style_alignment}
                  </p>
                </div>
                <div className="sm:pl-6 py-2 sm:py-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Database Approach
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {sections.overview.database_approach}
                  </p>
                </div>
              </div>

              {/* Core Modules as a Numbered List */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Core Subsystems &amp; Modules
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                  {sections.overview.core_modules.map((mod, i) => (
                    <div key={i} className="py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-wide">
                        {mod}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Design Considerations as clean bullet list */}
              <div className="pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Key Design Considerations
                </span>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 max-w-4xl">
                  {sections.overview.key_design_considerations.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-slate-400 mt-0.5">—</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 2: High-Level Design */}
            <section id="high-level" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  02. High-Level Design & Component Layers
                </h3>
                <span className="text-xs font-medium text-slate-400">{sections.high_level_design.components.length} Components</span>
              </div>

              {/* Full-width System Overview */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  System Overview
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
                  {sections.high_level_design.system_overview}
                </p>
              </div>

              {/* Components in a structured list with subtle separators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-2">
                {sections.high_level_design.components.map((comp, idx) => (
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
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                        {comp.layer}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
                      {comp.responsibility}
                    </p>
                    <div className="pl-7 pt-1 text-xs space-y-0.5 text-slate-500 dark:text-slate-400">
                      <p>
                        <strong className="text-slate-700 dark:text-slate-300">Technology:</strong> {comp.technology}
                      </p>
                      {comp.key_interactions.length > 0 && (
                        <p>
                          <strong className="text-slate-700 dark:text-slate-300">Interactions:</strong> {comp.key_interactions.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Low-Level Design */}
            <section id="low-level" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  03. Low-Level Design & Applied Patterns
                </h3>
                <span className="text-xs font-medium text-slate-400">{sections.low_level_design.modules.length} Modules</span>
              </div>

              {/* Error Handling and Patterns in divided columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-3 border-y border-slate-200 dark:border-slate-800">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Error Handling Strategy
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {sections.low_level_design.error_handling_strategy}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Design Patterns Applied
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {sections.low_level_design.design_patterns_applied.map((pat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60"
                      >
                        {pat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical Modules List with Code Typography */}
              <div className="space-y-6 pt-2">
                {sections.low_level_design.modules.map((mod, idx) => (
                  <div key={idx} className="pb-5 border-b border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                          {mod.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {mod.design_pattern && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Pattern: <strong className="text-slate-800 dark:text-slate-200 font-medium">{mod.design_pattern}</strong>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                          {mod.module_type}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                      {mod.responsibility}
                    </p>
                    {mod.key_methods.length > 0 && (
                      <div className="pl-7 pt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Methods:</span>
                        {mod.key_methods.map((method, i) => (
                          <code
                            key={i}
                            className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
                          >
                            {method}
                          </code>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Technology Stack */}
            <section id="tech-stack" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  04. Technology Stack & Layering
                </h3>
                <span className="text-xs font-medium text-slate-400">{sections.technology_stack.technologies.length} Technologies</span>
              </div>

              {/* Clean Technical Table without Card Wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-2.5 pr-6 w-1/4">Technology</th>
                      <th className="py-2.5 pr-6 w-28">Layer</th>
                      <th className="py-2.5 pr-6">Purpose</th>
                      <th className="py-2.5">Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {sections.technology_stack.technologies.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-3 pr-6 font-semibold text-slate-900 dark:text-white">{t.technology}</td>
                        <td className="py-3 pr-6">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                            {t.layer}
                          </span>
                        </td>
                        <td className="py-3 pr-6 text-slate-700 dark:text-slate-300 leading-relaxed">{t.purpose}</td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 leading-relaxed">{t.justification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5: Folder Structure */}
            <section id="folder-structure" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  05. Project & Repository Structure
                </h3>
                <span className="text-xs font-medium text-slate-400">Source Tree Layout</span>
              </div>

              {/* Monospace Tree Document without decorative card */}
              <div className="space-y-3">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
                  {sections.folder_structure.description}
                </p>
                <div className="rounded-md bg-slate-950 p-5 overflow-x-auto text-slate-200 font-mono text-xs leading-relaxed border border-slate-800 shadow-sm">
                  <pre className="selection:bg-brand-900">{sections.folder_structure.structure_tree}</pre>
                </div>
              </div>
            </section>

            {/* Section 6: Database Design */}
            <section id="database-design" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  06. Database Schema & Entity Design
                </h3>
                <span className="text-xs font-medium text-slate-400">{sections.database_design.entities.length} Entities</span>
              </div>

              {/* Database Overview in divided columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-3 border-y border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Database Technology
                  </span>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                    {sections.database_design.db_technology}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Schema Strategy
                  </span>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                    {sections.database_design.schema_strategy}
                  </p>
                </div>
              </div>

              {/* Entity Tables with clean borders */}
              <div className="space-y-8 pt-2">
                {sections.database_design.entities.map((entity, idx) => (
                  <div key={idx} className="space-y-3 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 font-mono">
                          ENTITY:
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                          {entity.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                        {entity.description}
                      </p>
                    </div>

                    {entity.fields.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                              <th className="py-2 pr-4 font-semibold w-1/4">Field</th>
                              <th className="py-2 pr-4 font-semibold w-1/4">Data Type</th>
                              <th className="py-2 font-semibold">Constraints</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                            {entity.fields.map((f, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                <td className="py-2 pr-4 font-mono font-medium text-slate-900 dark:text-slate-200">{f.name}</td>
                                <td className="py-2 pr-4 font-mono text-slate-600 dark:text-slate-400">{f.data_type}</td>
                                <td className="py-2 text-slate-600 dark:text-slate-400">{f.constraints}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {entity.relationships.length > 0 && (
                      <div className="pt-1 text-xs flex items-start gap-2">
                        <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider shrink-0 mt-0.5">Relations:</span>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 dark:text-slate-400">
                          {entity.relationships.map((r, j) => (
                            <span key={j} className="flex items-center gap-1.5">
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span>{r}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 7: API Specifications */}
            <section id="api-specs" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  07. API Specifications & Contracts
                </h3>
                <span className="text-xs font-medium text-slate-400">{sections.api_specifications.endpoints.length} Endpoints</span>
              </div>

              {/* API Metadata Header */}
              <div className="flex flex-wrap gap-4 text-xs py-2 border-y border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">
                  Base URL: <strong className="font-mono text-slate-900 dark:text-white ml-1">{sections.api_specifications.base_url}</strong>
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-slate-600 dark:text-slate-400">
                  Auth: <strong className="text-slate-900 dark:text-white ml-1">{sections.api_specifications.auth_mechanism}</strong>
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-slate-600 dark:text-slate-400">
                  Versioning: <strong className="text-slate-900 dark:text-white ml-1">{sections.api_specifications.versioning_strategy}</strong>
                </span>
              </div>

              {/* Professional API Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-2.5 pr-4 w-20">Method</th>
                      <th className="py-2.5 pr-6 w-1/3">Endpoint</th>
                      <th className="py-2.5 pr-6">Purpose / Request Shape</th>
                      <th className="py-2.5 w-36">Response / Codes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {sections.api_specifications.endpoints.map((ep, i) => {
                      const methodColors: Record<string, string> = {
                        GET: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
                        POST: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50',
                        PUT: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
                        PATCH: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50',
                        DELETE: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
                      };
                      const color = methodColors[ep.method.toUpperCase()] || 'bg-slate-100 text-slate-600 border-slate-200';

                      return (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="py-3 pr-4 align-top">
                            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${color}`}>
                              {ep.method.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 pr-6 align-top">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                                {ep.path}
                              </code>
                              {!ep.auth_required && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                  Public
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-6 align-top space-y-1">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{ep.purpose}</p>
                            {ep.request_body && ep.request_body !== 'None' && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                <span className="text-slate-400">Body: </span>{ep.request_body}
                              </p>
                            )}
                          </td>
                          <td className="py-3 align-top space-y-1.5">
                            <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                              {ep.response_shape}
                            </div>
                            {ep.status_codes.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {ep.status_codes.map((sc, j) => (
                                  <span key={j} className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                                    {sc}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          /* Empty State if not generated yet */
          <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center max-w-lg mx-auto space-y-3">
            <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No Software Design Generated Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transform your Architecture Blueprint into comprehensive ER diagrams, class models, folder structures, and API specifications.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                onClick={handleGenerate}
                isLoading={isGenerating}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Generate Software Design
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Regenerate Confirmation Modal */}
      <Modal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        title="Regenerate Software Design"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            Generate Software Design v{(softwareDesign?.version ?? 0) + 1} from Architecture Blueprint v{activeBlueprintVersion}.
            Your previous design versions will be preserved.
          </p>
          {blueprintVersions.length > 1 && (
            <div className="flex items-center gap-2 pt-1">
              <label htmlFor="modal-blueprint-version-select" className="font-medium text-slate-700 dark:text-slate-300">
                Source Blueprint:
              </label>
              <select
                id="modal-blueprint-version-select"
                value={activeBlueprintVersion}
                onChange={(e) => setActiveBlueprintVersion(Number(e.target.value))}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {blueprintVersions.map((bp) => (
                  <option key={bp.version} value={bp.version}>
                    Blueprint v{bp.version}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setShowRegenerateModal(false)}>
              Cancel
            </Button>
            <Button
              id="confirm-regenerate-design-btn"
              size="sm"
              onClick={handleGenerate}
              isLoading={isGenerating}
            >
              Regenerate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      {(() => {
        const selectedSdItem = designVersions.find((v) => v.version === exportSdVersion);
        const sourceBpVersion = selectedSdItem?.blueprint_version;
        const hasVersionMismatch =
          exportScope === 'documentation' &&
          sourceBpVersion !== undefined &&
          exportBpVersion !== sourceBpVersion;

        return (
          <Modal
            isOpen={showExportModal}
            onClose={() => !isExporting && setShowExportModal(false)}
            title="Export Documentation"
          >
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Generate an authoritative, publication-ready architectural and engineering document in Microsoft Word (.docx) or PDF (.pdf).
              </p>

              {/* Scope Selector: 3 Options */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Export Scope
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    id="scope-software-design"
                    onClick={() => setExportScope('software_design')}
                    className={`p-2.5 rounded-md border text-left transition-colors ${
                      exportScope === 'software_design'
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30 text-brand-900 dark:text-brand-100 ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs">Software Design Only</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">LLD, APIs, ER/Class models</div>
                  </button>

                  <button
                    type="button"
                    id="scope-blueprint"
                    onClick={() => setExportScope('blueprint')}
                    className={`p-2.5 rounded-md border text-left transition-colors ${
                      exportScope === 'blueprint'
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30 text-brand-900 dark:text-brand-100 ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs">Blueprint Only</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">High-level architecture & ADRs</div>
                  </button>

                  <button
                    type="button"
                    id="scope-documentation"
                    onClick={() => setExportScope('documentation')}
                    className={`p-2.5 rounded-md border text-left transition-colors ${
                      exportScope === 'documentation'
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30 text-brand-900 dark:text-brand-100 ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs">Complete Documentation</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Unified Part I & Part II</div>
                  </button>
                </div>
              </div>

              {/* Conditional Version Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {(exportScope === 'blueprint' || exportScope === 'documentation') && (
                  <div className="space-y-1.5">
                    <label htmlFor="export-bp-version-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Architecture Blueprint Version
                    </label>
                    <select
                      id="export-bp-version-select"
                      value={exportBpVersion}
                      onChange={(e) => setExportBpVersion(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      {blueprintVersions.map((bp) => (
                        <option key={bp.version} value={bp.version}>
                          Version {bp.version} ({new Date(bp.created_at).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(exportScope === 'software_design' || exportScope === 'documentation') && (
                  <div className="space-y-1.5">
                    <label htmlFor="export-sd-version-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Software Design Version
                    </label>
                    <select
                      id="export-sd-version-select"
                      value={exportSdVersion}
                      onChange={(e) => setExportSdVersion(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      {designVersions.map((sd) => (
                        <option key={sd.version} value={sd.version}>
                          Version {sd.version} (Derived from BP v{sd.blueprint_version})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Version Compatibility Warning for Option C */}
              {hasVersionMismatch && (
                <div className="p-3 rounded-md bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      The selected Software Design was generated using Blueprint Version {sourceBpVersion}, but you selected Blueprint Version {exportBpVersion}. These documents may represent different architectural states.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1 text-[11px] font-medium text-amber-900 dark:text-amber-100">
                    <input
                      type="checkbox"
                      id="acknowledge-version-mismatch"
                      checked={acknowledgedMismatch}
                      onChange={(e) => setAcknowledgedMismatch(e.target.checked)}
                      className="rounded border-amber-400 text-brand-600 focus:ring-brand-500"
                    />
                    <span>I understand and wish to proceed with this version pairing.</span>
                  </label>
                </div>
              )}

              {/* Format Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="sd-export-format-docx"
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
                    id="sd-export-format-pdf"
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
                  id="confirm-export-documentation-btn"
                  size="sm"
                  isLoading={isExporting}
                  disabled={isExporting || (hasVersionMismatch && !acknowledgedMismatch)}
                  onClick={handleExecuteExport}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Export Document
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </DashboardLayout>
  );
};

export default SoftwareDesignPage;
