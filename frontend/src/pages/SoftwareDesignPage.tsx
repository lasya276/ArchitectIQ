import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { MermaidDiagram } from '../components/ui/MermaidDiagram';
import {
  ArrowLeft,
  Sparkles,
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
  CheckCircle2,
  ChevronDown,
  Box,
  Link2,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { blueprintService } from '../services/blueprintService';
import { softwareDesignService } from '../services/softwareDesignService';
import {
  Project,
  SoftwareDesign,
  SoftwareDesignVersionItem,
  normalizeDiagrams,
} from '../api/types';

export const SoftwareDesignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Blueprint version passed from BlueprintPage via navigation state ─────
  const navState = (location.state as { blueprintVersion?: number } | null) || {};
  const [activeBlueprintVersion, setActiveBlueprintVersion] = useState<number>(
    navState.blueprintVersion ?? 1
  );

  const [project, setProject] = useState<Project | null>(null);
  const [softwareDesign, setSoftwareDesign] = useState<SoftwareDesign | null>(null);
  const [designVersions, setDesignVersions] = useState<SoftwareDesignVersionItem[]>([]);
  const [selectedDesignVersion, setSelectedDesignVersion] = useState<number | null>(null);
  const [latestArchVersion, setLatestArchVersion] = useState<number>(activeBlueprintVersion);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<string>('overview');
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // ── Fetch project, blueprint metadata, and existing software design ───────
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

      if (bpVersionsData.length > 0) {
        setLatestArchVersion(bpVersionsData[0].version);
        // If no blueprintVersion was passed via nav state, use the latest
        if (!navState.blueprintVersion) {
          setActiveBlueprintVersion(bpVersionsData[0].version);
        }
      }

      // Try to load an existing software design
      const [existingDesign, existingVersions] = await Promise.all([
        softwareDesignService.getDesign(id).catch(() => null),
        softwareDesignService.getDesignVersions(id).catch(() => []),
      ]);

      if (existingDesign) {
        setSoftwareDesign(existingDesign);
        setSelectedDesignVersion(existingDesign.version);
      }
      setDesignVersions(existingVersions);
    } catch (err: any) {
      setError(err.message || 'Failed to load project design data.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Generate new software design ─────────────────────────────────────────
  const handleGenerate = async () => {
    if (!id) return;
    setIsGenerating(true);
    setGenerationError(null);
    setShowRegenerateModal(false);
    try {
      const newDesign = await softwareDesignService.generateDesign(id, activeBlueprintVersion);
      setSoftwareDesign(newDesign);
      setSelectedDesignVersion(newDesign.version);
      // Refresh version list
      const versions = await softwareDesignService.getDesignVersions(id).catch(() => []);
      setDesignVersions(versions);
      // After generation, preserve the same blueprint version for future regeneration
      setActiveBlueprintVersion(newDesign.blueprint_version);
    } catch (err: any) {
      setGenerationError(
        err.message || 'Software design generation failed. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Switch design version ─────────────────────────────────────────────────
  const handleVersionSwitch = async (version: number) => {
    if (!id || version === selectedDesignVersion) return;
    try {
      const design = await softwareDesignService.getDesign(id, version);
      setSoftwareDesign(design);
      setSelectedDesignVersion(version);
      // Keep activeBlueprintVersion in sync with the selected design's source blueprint
      setActiveBlueprintVersion(design.blueprint_version);
    } catch {
      // Keep existing design on error
    }
  };

  // ── Export design as markdown ─────────────────────────────────────────────
  const handleExportMarkdown = () => {
    if (!softwareDesign || !project) return;
    const s = softwareDesign.sections;
    const lines: string[] = [
      `# ${project.title} — Software Design v${softwareDesign.version}`,
      `> Derived from Architecture Blueprint v${softwareDesign.blueprint_version}`,
      '',
      '## 1. Overview',
      `**Design Approach:** ${s.overview.design_approach}`,
      `**Application Type:** ${s.overview.application_type}`,
      `**Architecture Alignment:** ${s.overview.architectural_style_alignment}`,
      `**Database Approach:** ${s.overview.database_approach}`,
      `**Core Modules:** ${s.overview.core_modules.join(', ')}`,
      `**Key Considerations:** ${s.overview.key_design_considerations.join('; ')}`,
      '',
      '## 2. High-Level Design',
      s.high_level_design.system_overview,
      '',
      ...s.high_level_design.components.map(
        (c) => `### ${c.name} (${c.layer})\n- **Responsibility:** ${c.responsibility}\n- **Technology:** ${c.technology}\n- **Interactions:** ${c.key_interactions.join(', ')}`
      ),
      '',
      '## 3. Low-Level Design',
      `**Error Handling:** ${s.low_level_design.error_handling_strategy}`,
      `**Design Patterns:** ${s.low_level_design.design_patterns_applied.join(', ')}`,
      '',
      ...s.low_level_design.modules.map(
        (m) => `### ${m.name} (${m.module_type})\n- **Responsibility:** ${m.responsibility}\n- **Pattern:** ${m.design_pattern || 'N/A'}\n- **Methods:** ${m.key_methods.join('; ')}`
      ),
      '',
      '## 4. Technology Stack',
      ...s.technology_stack.technologies.map(
        (t) => `### ${t.layer}: ${t.technology}\n- **Purpose:** ${t.purpose}\n- **Justification:** ${t.justification}`
      ),
      '',
      '## 5. Folder Structure',
      '```',
      s.folder_structure.structure_tree,
      '```',
      s.folder_structure.description,
      '',
      '## 6. Database Design',
      `**Technology:** ${s.database_design.db_technology}`,
      `**Strategy:** ${s.database_design.schema_strategy}`,
      '',
      ...s.database_design.entities.map(
        (e) =>
          `### ${e.name}\n${e.description}\n` +
          e.fields.map((f) => `- \`${f.name}\` (${f.data_type}) ${f.constraints}`).join('\n')
      ),
      '',
      '## 7. API Specifications',
      `**Auth:** ${s.api_specifications.auth_mechanism}`,
      `**Base URL:** ${s.api_specifications.base_url}`,
      '',
      ...s.api_specifications.endpoints.map(
        (ep) =>
          `### ${ep.method} ${ep.path}\n- **Purpose:** ${ep.purpose}\n- **Auth:** ${ep.auth_required ? 'Required' : 'Public'}\n- **Response:** ${ep.response_shape}`
      ),
      '',
      '## 8. Diagrams',
      ...normalizeDiagrams(s.diagrams).map(
        (d) => `### ${d.title} (${d.diagram_type})\n${d.description}\n\`\`\`mermaid\n${d.mermaid_code}\n\`\`\``
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.title.replace(/\s+/g, '_')}_SoftwareDesign_v${softwareDesign.version}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const navSections = [
    { id: 'overview', label: '1. Overview', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'high-level', label: '2. High-Level Design', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'low-level', label: '3. Low-Level Design', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'tech-stack', label: '4. Tech Stack', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'folder-structure', label: '5. Folder Structure', icon: <Workflow className="w-3.5 h-3.5" /> },
    { id: 'database-design', label: '6. Database Design', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'api-specs', label: '7. API Specifications', icon: <Plug className="w-3.5 h-3.5" /> },
    { id: 'diagrams', label: '8. Diagrams', icon: <GitMerge className="w-3.5 h-3.5" /> },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" className="text-indigo-600" />
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
        <div className="py-16 text-center">
          <Card className="max-w-md mx-auto p-6">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Project Not Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              {error || 'Failed to load details for this workspace.'}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const hasDesign = !!softwareDesign;
  const sections = softwareDesign?.sections;

  // ── Section: Empty State Placeholder ─────────────────────────────────────
  const EmptyState: React.FC<{ icon: React.ReactNode; label: string; description: string }> = ({
    icon, label, description
  }) => (
    <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-2">
        {icon}
      </div>
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{label}</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      {!hasDesign && !isGenerating && (
        <Button
          size="sm"
          variant="outline"
          className="mt-3 text-[11px]"
          onClick={handleGenerate}
          leftIcon={<Sparkles className="w-3 h-3 text-indigo-500" />}
        >
          Generate Software Design
        </Button>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* ── Top Header Bar ───────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              id="back-to-blueprint-btn"
              onClick={() => navigate(`/workspace/${id}/blueprint`)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to Architecture Blueprint"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Software Design Workspace
                </span>
                {hasDesign && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      v{softwareDesign.version}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {softwareDesign.status}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      from Blueprint v{softwareDesign.blueprint_version}
                    </span>
                  </>
                )}
                {!hasDesign && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                    Not Generated
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {project.title}
              </h2>
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
                  className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {designVersions.map((v) => (
                    <option key={v.version} value={v.version}>
                      Design v{v.version} · Blueprint v{v.blueprint_version}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            )}

            {hasDesign && (
              <Button
                id="export-design-btn"
                variant="outline"
                size="sm"
                onClick={handleExportMarkdown}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export Design
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
                ) : hasDesign ? (
                  <RefreshCw className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )
              }
            >
              {isGenerating
                ? 'Generating...'
                : hasDesign
                ? 'Regenerate Design'
                : 'Generate Software Design'}
            </Button>
          </div>
        </div>

        {/* ── Generating Banner ─────────────────────────────────────────────── */}
        {isGenerating && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400">
            <Spinner size="sm" />
            <div>
              <p className="text-xs font-semibold">Generating Software Design...</p>
              <p className="text-[11px] mt-0.5 text-indigo-600/80 dark:text-indigo-400/80">
                AI is analysing Architecture Blueprint v{activeBlueprintVersion} and deriving a complete software design. This may take up to a minute.
              </p>
            </div>
          </div>
        )}

        {/* ── Generation Error Banner ───────────────────────────────────────── */}
        {generationError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold">Generation Failed</p>
              <p className="text-[11px] mt-0.5">{generationError}</p>
              <button
                onClick={handleGenerate}
                className="mt-2 text-[11px] underline underline-offset-2 hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ── Tab / Navigation Progression Bar ─────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => navigate(`/workspace/${id}`)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Workspace Specification</span>
          </button>
          <button
            onClick={() => navigate(`/workspace/${id}/blueprint`)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-slate-400" />
            <span>Architecture Blueprint v{latestArchVersion}</span>
          </button>
          <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-sm">
            <Code2 className="w-4 h-4" />
            <span>Software Design{hasDesign ? ` v${softwareDesign.version}` : ''}</span>
          </button>
        </div>

        {/* ── Quick Jump Section Links ──────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80 scrollbar-none">
          {navSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeSection === sec.id
                  ? 'bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </button>
          ))}
        </div>

        {/* ── Software Design Sections ──────────────────────────────────────── */}
        <div className="space-y-6">

          {/* ── Section 1: Overview ──────────────────────────────────────────── */}
          <Card id="overview" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Eye className="w-4 h-4" />
                <span>1. Overview</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Design Direction & Core Choices</span>
            </div>

            {hasDesign && sections ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Design Approach</p>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{sections.overview.design_approach}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Application Type</p>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{sections.overview.application_type}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Architecture Alignment</p>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{sections.overview.architectural_style_alignment}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Database Approach</p>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{sections.overview.database_approach}</p>
                  </div>
                </div>
                {sections.overview.core_modules.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Core Modules</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sections.overview.core_modules.map((mod, i) => (
                        <span key={i} className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {sections.overview.key_design_considerations.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Key Design Considerations</p>
                    <ul className="space-y-1">
                      {sections.overview.key_design_considerations.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Eye className="w-4 h-4 text-slate-400" />}
                label="Software Design"
                description="Generate a detailed software design from this architecture blueprint."
              />
            )}
          </Card>

          {/* ── Section 2: High-Level Design ─────────────────────────────────── */}
          <Card id="high-level" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>2. High-Level Design</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Software Modules & System Boundaries</span>
            </div>

            {hasDesign && sections ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  {sections.high_level_design.system_overview}
                </p>
                <div className="space-y-2">
                  {sections.high_level_design.components.map((comp, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">{comp.name}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {comp.layer}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {comp.technology}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{comp.responsibility}</p>
                      {comp.key_interactions.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          <Link2 className="w-3 h-3 inline mr-1" />
                          {comp.key_interactions.join(' · ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {sections.high_level_design.interaction_summary && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    {sections.high_level_design.interaction_summary}
                  </p>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Layers className="w-4 h-4 text-slate-400" />}
                label="High-level module definitions will be generated here."
                description="Decomposes your architecture blueprint into cohesive backend services or domain packages."
              />
            )}
          </Card>

          {/* ── Section 3: Low-Level Design ───────────────────────────────────── */}
          <Card id="low-level" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Code2 className="w-4 h-4" />
                <span>3. Low-Level Design</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Detailed Classes, Services & Controllers</span>
            </div>

            {hasDesign && sections ? (
              <div className="space-y-4">
                {sections.low_level_design.design_patterns_applied.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Design Patterns Applied</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sections.low_level_design.design_patterns_applied.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {sections.low_level_design.modules.map((mod, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">{mod.name}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {mod.module_type}
                        </span>
                        {mod.design_pattern && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            {mod.design_pattern}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{mod.responsibility}</p>
                      {mod.key_methods.length > 0 && (
                        <div className="mt-1.5">
                          <p className="text-[10px] text-slate-400 mb-1 font-medium">Methods:</p>
                          <ul className="space-y-0.5">
                            {mod.key_methods.map((m, j) => (
                              <li key={j} className="text-[11px] text-slate-500 dark:text-slate-400 font-mono pl-2 border-l border-slate-300 dark:border-slate-700">
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {sections.low_level_design.error_handling_strategy && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1">Error Handling Strategy</p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">{sections.low_level_design.error_handling_strategy}</p>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Code2 className="w-4 h-4 text-slate-400" />}
                label="Low-level logic definitions will be generated here."
                description="Identifies code-level contracts, patterns, and object structures."
              />
            )}
          </Card>

          {/* ── Section 4: Technology Stack ───────────────────────────────────── */}
          <Card id="tech-stack" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Cpu className="w-4 h-4" />
                <span>4. Technology Stack</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Detailed Libraries & Frameworks</span>
            </div>

            {hasDesign && sections ? (
              <div className="space-y-3">
                {/* Group by layer */}
                {Array.from(new Set(sections.technology_stack.technologies.map((t) => t.layer))).map((layer) => (
                  <div key={layer}>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">{layer}</p>
                    <div className="space-y-2">
                      {sections.technology_stack.technologies
                        .filter((t) => t.layer === layer)
                        .map((tech, i) => (
                          <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs text-slate-900 dark:text-white">{tech.technology}</span>
                              <span className="text-[11px] text-slate-400">·</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">{tech.purpose}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">{tech.justification}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
                {sections.technology_stack.version_strategy && (
                  <p className="text-[11px] text-slate-400 italic pt-1">
                    Version strategy: {sections.technology_stack.version_strategy}
                  </p>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Cpu className="w-4 h-4 text-slate-400" />}
                label="Technology choices details will be generated here."
                description="Exposes specific dependencies and version considerations based on the blueprint tech stack."
              />
            )}
          </Card>

          {/* ── Section 5: Folder Structure ───────────────────────────────────── */}
          <Card id="folder-structure" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Workflow className="w-4 h-4" />
                <span>5. Folder Structure</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Project Directory Hierarchy</span>
            </div>

            {hasDesign && sections ? (
              <div className="space-y-3">
                <pre className="text-[11px] font-mono leading-relaxed text-slate-700 dark:text-slate-200 bg-slate-950 dark:bg-black p-4 rounded-xl overflow-x-auto border border-slate-800 whitespace-pre">
                  {sections.folder_structure.structure_tree}
                </pre>
                <p className="text-xs text-slate-600 dark:text-slate-300">{sections.folder_structure.description}</p>
                {sections.folder_structure.naming_conventions && (
                  <p className="text-[11px] text-slate-400 italic">
                    Naming conventions: {sections.folder_structure.naming_conventions}
                  </p>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Workflow className="w-4 h-4 text-slate-400" />}
                label="Visual file tree will be generated here."
                description="Generates a clean directory layout conforming to the architectural style (e.g. modular or layered)."
              />
            )}
          </Card>

          {/* ── Section 6: Database Design ────────────────────────────────────── */}
          <Card id="database-design" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Database className="w-4 h-4" />
                <span>6. Database Design</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Table Schemas & Entity Relations</span>
            </div>

            {hasDesign && sections ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex-1 min-w-[200px]">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Database Technology</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{sections.database_design.db_technology}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex-1 min-w-[200px]">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Schema Strategy</p>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{sections.database_design.schema_strategy}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex-1 min-w-[200px]">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Migration Strategy</p>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{sections.database_design.migration_strategy}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {sections.database_design.entities.map((entity, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <div className="flex items-center gap-2 mb-2">
                        <Box className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">{entity.name}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                          {entity.entity_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{entity.description}</p>
                      {entity.fields.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-[11px] text-left">
                            <thead>
                              <tr className="text-[10px] uppercase tracking-wide text-slate-400">
                                <th className="pb-1 pr-3">Field</th>
                                <th className="pb-1 pr-3">Type</th>
                                <th className="pb-1">Constraints</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entity.fields.map((field, j) => (
                                <tr key={j} className="border-t border-slate-200 dark:border-slate-800">
                                  <td className="py-1 pr-3 font-mono text-slate-700 dark:text-slate-200">{field.name}</td>
                                  <td className="py-1 pr-3 text-violet-600 dark:text-violet-400 font-mono">{field.data_type}</td>
                                  <td className="py-1 text-slate-400">{field.constraints || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {entity.relationships.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <p className="text-[10px] font-medium text-slate-400 mb-1">Relationships:</p>
                          {entity.relationships.map((r, j) => (
                            <p key={j} className="text-[11px] text-slate-500 dark:text-slate-400">· {r}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Database className="w-4 h-4 text-slate-400" />}
                label="Schema definitions and ER relationships will be generated here."
                description="Detailed SQL or NoSQL document mapping according to storage specs."
              />
            )}
          </Card>

          {/* ── Section 7: API Specifications ─────────────────────────────────── */}
          <Card id="api-specs" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Plug className="w-4 h-4" />
                <span>7. API Specifications</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">REST Endpoints & Contracts</span>
            </div>

            {hasDesign && sections ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3 text-[11px]">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                    Base: <strong>{sections.api_specifications.base_url}</strong>
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                    Auth: <strong>{sections.api_specifications.auth_mechanism}</strong>
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                    Versioning: <strong>{sections.api_specifications.versioning_strategy}</strong>
                  </span>
                </div>
                <div className="space-y-2">
                  {sections.api_specifications.endpoints.map((ep, i) => {
                    const methodColors: Record<string, string> = {
                      GET: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                      POST: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
                      PUT: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                      PATCH: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
                      DELETE: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
                    };
                    const color = methodColors[ep.method.toUpperCase()] || 'bg-slate-100 text-slate-600';
                    return (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded font-mono ${color}`}>
                            {ep.method.toUpperCase()}
                          </span>
                          <code className="text-xs font-mono text-slate-700 dark:text-slate-200">{ep.path}</code>
                          {!ep.auth_required && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-200 dark:bg-slate-800 text-slate-500">Public</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{ep.purpose}</p>
                        <div className="mt-1.5 grid grid-cols-2 gap-2 text-[11px]">
                          {ep.request_body && ep.request_body !== 'None' && (
                            <div>
                              <span className="text-slate-400 font-medium">Request: </span>
                              <span className="text-slate-600 dark:text-slate-300 font-mono">{ep.request_body}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-400 font-medium">Response: </span>
                            <span className="text-slate-600 dark:text-slate-300 font-mono">{ep.response_shape}</span>
                          </div>
                        </div>
                        {ep.status_codes.length > 0 && (
                          <div className="mt-1 flex gap-1 flex-wrap">
                            {ep.status_codes.map((sc, j) => (
                              <span key={j} className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-200 dark:bg-slate-800 text-slate-500">
                                {sc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Plug className="w-4 h-4 text-slate-400" />}
                label="API endpoint contracts will be generated here."
                description="Structures the complete OpenAPI design contracts for all gateway operations."
              />
            )}
          </Card>

          {/* ── Section 8: Diagrams ───────────────────────────────────────────── */}
          <Card id="diagrams" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <GitMerge className="w-4 h-4" />
                <span>8. Diagrams</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">ER · Class · Component Diagrams</span>
            </div>

            {hasDesign && sections ? (
              <div className="space-y-6">
                {normalizeDiagrams(sections.diagrams).map((diagram, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">{diagram.title}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                        {diagram.diagram_type}
                      </span>
                    </div>
                    {diagram.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{diagram.description}</p>
                    )}
                    <MermaidDiagram
                      code={diagram.mermaid_code}
                      diagramIndex={i}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<GitMerge className="w-4 h-4 text-slate-400" />}
                label="Mermaid.js class models and ER diagrams will be rendered here."
                description="Provides visual references for database tables and interface relationships."
              />
            )}
          </Card>
        </div>
      </div>

      {/* ── Regenerate Confirmation Modal ─────────────────────────────────── */}
      <Modal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        title="Regenerate Software Design"
      >
        <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">A new version will be created</p>
              <p className="text-[11px] mt-0.5">
                This will generate Software Design v{(softwareDesign?.version ?? 0) + 1} from Architecture Blueprint v{activeBlueprintVersion}.
                Your existing design versions will be preserved.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setShowRegenerateModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleGenerate}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Regenerate
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Export Modal ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Software Design"
      >
        <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Export Software Design v{softwareDesign?.version} as a Markdown document.
            All 8 sections will be included.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => { handleExportMarkdown(); setShowExportModal(false); }}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download Markdown
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default SoftwareDesignPage;
