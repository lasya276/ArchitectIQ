import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import {
  ArrowLeft,
  Sparkles,
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
  CheckCircle2,
  Server,
  Code2,
  Lock,
  ChevronDown,
  ChevronUp,
  FileText,
  Workflow,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { blueprintService } from '../services/blueprintService';
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
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Expanded ADR and Risk states
  const [expandedDecisions, setExpandedDecisions] = useState<Record<number, boolean>>({});
  const [expandedRisks, setExpandedRisks] = useState<Record<number, boolean>>({});

  const toggleDecision = (idx: number) => {
    setExpandedDecisions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleRisk = (idx: number) => {
    setExpandedRisks((prev) => ({ ...prev, [idx]: !prev[idx] }));
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
      // Step 1: Read workspace
      await new Promise((r) => setTimeout(r, 400));
      setRegenerateStep(2);

      // Step 2: Synthesize components
      await new Promise((r) => setTimeout(r, 400));
      setRegenerateStep(3);

      // Step 3: Call generation API
      const newBp = await blueprintService.generateBlueprint(id, { increment_version: true });
      setRegenerateStep(4);
      await new Promise((r) => setTimeout(r, 300));

      setBlueprint(newBp);
      setSelectedVersion(newBp.version);

      // Refresh version list
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

  // Export blueprint as structured Markdown file
  const handleExportMarkdown = () => {
    if (!blueprint || !project) return;
    const { sections } = blueprint;

    const mdContent = `# Architecture Blueprint: ${project.title} (v${blueprint.version})
Generated on: ${new Date(blueprint.created_at).toLocaleString()}
Status: ${blueprint.status.toUpperCase()}

---

## 1. Architecture Overview
- **Domain:** ${sections.overview.domain}
- **Primary Focus:** ${sections.overview.primary_focus}
- **Scope & Scale:** ${sections.overview.scope}

${sections.overview.summary}

---

## 2. Architecture Style & Patterns
- **Style:** ${sections.architecture_style.style_name}
- **Pattern:** ${sections.architecture_style.pattern_type}

**Justification:**
${sections.architecture_style.justification}

---

## 3. Technology Stack
- **Frontend:** ${sections.tech_stack.frontend.join(', ') || 'Not specified'}
- **Backend:** ${sections.tech_stack.backend.join(', ') || 'Not specified'}
- **Database:** ${sections.tech_stack.database.join(', ') || 'Not specified'}
- **DevOps / Infrastructure:** ${sections.tech_stack.devops_infrastructure.join(', ') || 'Not specified'}
- **Third-Party Services:** ${sections.tech_stack.third_party_services.join(', ') || 'None specified'}

---

## 4. System Components
${sections.components
  .map(
    (c) => `### ${c.name} (${c.type})
- **Responsibility:** ${c.responsibility}
- **Interfaces:** ${c.interfaces.join(', ')}`
  )
  .join('\n\n')}

---

## 5. Component Relationships
${sections.component_relationships
  .map((r) => `- **${r.source}** → **${r.target}**: ${r.interaction} (${r.protocol})`)
  .join('\n')}

---

## 6. Data Architecture
- **Storage Strategy:** ${sections.data_architecture.storage_strategy}
- **Data Stores:** ${sections.data_architecture.data_stores.join(', ')}
- **Data Flow:** ${sections.data_architecture.data_flow}

---

## 7. External Integrations
${sections.integrations
  .map((i) => `### ${i.name}
- **Purpose:** ${i.purpose}
- **Protocol:** ${i.protocol}`)
  .join('\n\n')}

---

## 8. Security & Quality Considerations
- **Security Controls:** ${sections.security_and_quality.security_controls.join(', ')}
- **Quality Attributes:** ${sections.security_and_quality.quality_attributes.join(', ')}
- **Compliance:** ${sections.security_and_quality.compliance.join(', ')}

---

## 9. Architecture Decisions & Rationale (ADR)
${sections.decisions_and_rationale
  .map(
    (d, idx) => `### ADR-${idx + 1}: ${d.decision}
- **Rationale:** ${d.rationale}
- **Grounded Requirement:** ${d.grounded_requirement}
- **Alternatives Considered:** ${d.alternatives_considered.join(', ')}`
  )
  .join('\n\n')}

---

## 10. Risks & Trade-offs
${sections.risks_and_tradeoffs
  .map(
    (rk) => `### Risk: ${rk.risk}
- **Impact:** ${rk.impact}
- **Mitigation:** ${rk.mitigation}
- **Trade-off:** ${rk.tradeoff}`
  )
  .join('\n\n')}

---

## 11. Visual Architecture
\`\`\`mermaid
${sections.visual_diagram.mermaid_code}
\`\`\`
${sections.visual_diagram.description}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.title.replace(/\s+/g, '_')}_Blueprint_v${blueprint.version}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const navSections = [
    { id: 'overview', label: '1. Overview', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'style', label: '2. Style & Pattern', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'tech-stack', label: '3. Tech Stack', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'components', label: '4. Components', icon: <Server className="w-3.5 h-3.5" /> },
    { id: 'relationships', label: '5. Relationships', icon: <GitMerge className="w-3.5 h-3.5" /> },
    { id: 'data-arch', label: '6. Data Arch', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'integrations', label: '7. Integrations', icon: <Plug className="w-3.5 h-3.5" /> },
    { id: 'security', label: '8. Security & Quality', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'decisions', label: '9. Decisions (ADR)', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
    { id: 'risks', label: '10. Risks & Trade-offs', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'diagram', label: '11. Visual Diagram', icon: <Workflow className="w-3.5 h-3.5" /> },
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
          <Spinner size="lg" className="text-indigo-600" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading Architecture Blueprint dashboard...
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Blueprint Not Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              {error || 'No architecture blueprint has been generated yet for this project.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/workspace/${id}`)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Workspace
              </Button>
              <Button
                size="sm"
                onClick={() => handleRegenerate()}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate Blueprint
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const sections = blueprint?.sections;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              id="back-to-workspace-btn"
              onClick={() => navigate(`/workspace/${id}`)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to Workspace"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Architecture Blueprint Dashboard
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  v{blueprint?.version ?? 1}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                  {blueprint?.status}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {project.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Version Selector Dropdown */}
            {versions.length > 1 && (
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Version:
                </label>
                <select
                  id="blueprint-version-select"
                  value={selectedVersion ?? 1}
                  onChange={(e) => handleSelectVersion(Number(e.target.value))}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              onClick={handleExportMarkdown}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export Blueprint
            </Button>

            <Button
              id="regenerate-blueprint-btn"
              size="sm"
              onClick={() => setShowRegenerateModal(true)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Regenerate Architecture
            </Button>
          </div>
        </div>

        {/* Workspace vs Blueprint Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => navigate(`/workspace/${id}`)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Workspace Specification</span>
          </button>
          <button
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Architecture Blueprint</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              v{blueprint?.version ?? 1}
            </span>
          </button>
        </div>

        {/* Quick Jump Section Links */}
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

        {/* Main 11 Blueprint Sections Content */}
        {sections && (
          <div className="space-y-6">
            {/* Section 1: Overview */}
            <Card id="overview" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Eye className="w-4 h-4" />
                  <span>1. Architecture Overview</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  Grounded in Project & Vision
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Domain
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {sections.overview.domain}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Primary Focus
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {sections.overview.primary_focus}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Scope Target
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {sections.overview.scope}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Executive Architecture Summary
                </label>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {sections.overview.summary}
                </p>
              </div>
            </Card>

            {/* Section 2: Architecture Style / Pattern */}
            <Card id="style" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Layers className="w-4 h-4" />
                  <span>2. Architecture Style & Design Patterns</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  Structural Paradigm
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Selected Architectural Style
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {sections.architecture_style.style_name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pattern: {sections.architecture_style.pattern_type}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Architectural Justification & Grounding
                </label>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {sections.architecture_style.justification}
                </p>
              </div>
            </Card>

            {/* Section 3: Technology Stack */}
            <Card id="tech-stack" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>3. Technology Stack Breakdown</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  Grounded in Platforms & Constraints
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Frontend */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Client & Frontend</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sections.tech_stack.frontend.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Backend */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Server className="w-3.5 h-3.5" />
                    <span>API & Backend Layer</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sections.tech_stack.backend.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Database */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Database className="w-3.5 h-3.5" />
                    <span>Data Tier & Storage</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sections.tech_stack.database.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* DevOps / Infrastructure */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Workflow className="w-3.5 h-3.5" />
                    <span>DevOps & Cloud Infrastructure</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sections.tech_stack.devops_infrastructure.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Third-Party */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2 md:col-span-2 lg:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <Plug className="w-3.5 h-3.5" />
                    <span>Third-Party & External Services</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sections.tech_stack.third_party_services.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 4: System Components */}
            <Card id="components" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Server className="w-4 h-4" />
                  <span>4. System Components & Responsibilities</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {sections.components.length} Core Modules
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {sections.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {comp.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                        {comp.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {comp.responsibility}
                    </p>
                    {comp.interfaces.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] font-medium text-slate-400">Interfaces:</span>
                        {comp.interfaces.map((intf, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {intf}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Section 5: Component Relationships */}
            <Card id="relationships" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <GitMerge className="w-4 h-4" />
                  <span>5. Component Interaction & Communication Flows</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  Data & Protocol Paths
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="py-2.5 px-3 font-semibold">Source Component</th>
                      <th className="py-2.5 px-3 font-semibold">Target Component</th>
                      <th className="py-2.5 px-3 font-semibold">Interaction Description</th>
                      <th className="py-2.5 px-3 font-semibold">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {sections.component_relationships.map((rel, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200">
                          {rel.source}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200">
                          {rel.target}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {rel.interaction}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                            {rel.protocol}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Section 6: Data Architecture */}
            <Card id="data-arch" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Database className="w-4 h-4" />
                  <span>6. Data Architecture & Persistence Strategy</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  Storage & Consistency
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Storage Strategy & Model
                  </label>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {sections.data_architecture.storage_strategy}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Target Data Stores
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {sections.data_architecture.data_stores.map((ds, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                      >
                        {ds}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    End-to-End Data Flow
                  </label>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                    {sections.data_architecture.data_flow}
                  </p>
                </div>
              </div>
            </Card>

            {/* Section 7: External Integrations */}
            <Card id="integrations" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Plug className="w-4 h-4" />
                  <span>7. External Integrations</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {sections.integrations.length} Services
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {sections.integrations.map((intg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {intg.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {intg.protocol}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {intg.purpose}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Section 8: Security & Quality */}
            <Card id="security" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>8. Security & Quality Considerations</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  Governance & Non-Functional
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Security Controls */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Security Controls</span>
                  </div>
                  <ul className="space-y-1.5">
                    {sections.security_and_quality.security_controls.map((ctrl, i) => (
                      <li
                        key={i}
                        className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5"
                      >
                        <span className="text-rose-500 mt-0.5">•</span>
                        <span>{ctrl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quality Attributes */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Quality Attributes</span>
                  </div>
                  <ul className="space-y-1.5">
                    {sections.security_and_quality.quality_attributes.map((qa, i) => (
                      <li
                        key={i}
                        className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5"
                      >
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{qa}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Compliance */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Compliance Standards</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sections.security_and_quality.compliance.map((cmp, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                      >
                        {cmp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 9: Architecture Decisions & Rationale (ADR) */}
            <Card id="decisions" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <FileCheck2 className="w-4 h-4" />
                  <span>9. Architecture Decisions & Rationale (ADR)</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {sections.decisions_and_rationale.length} Key Decisions
                </span>
              </div>

              <div className="space-y-3">
                {sections.decisions_and_rationale.map((adr, idx) => {
                  const isExpanded = expandedDecisions[idx] ?? true;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3.5 transition-colors"
                    >
                      <div
                        onClick={() => toggleDecision(idx)}
                        className="flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                            ADR-{idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {adr.decision}
                          </h4>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Rationale & Justification:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {adr.rationale}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Grounded Requirement:
                            </span>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                              {adr.grounded_requirement}
                            </p>
                          </div>
                          {adr.alternatives_considered.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                                Alternatives Considered:
                              </span>
                              {adr.alternatives_considered.map((alt, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded text-[10px] bg-slate-200/70 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 line-through"
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
            </Card>

            {/* Section 10: Risks & Trade-offs */}
            <Card id="risks" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>10. Risks & Trade-offs</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  Mitigations & Balances
                </span>
              </div>

              <div className="space-y-3">
                {sections.risks_and_tradeoffs.map((rk, idx) => {
                  const isExpanded = expandedRisks[idx] ?? true;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5"
                    >
                      <div
                        onClick={() => toggleRisk(idx)}
                        className="flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            Risk #{idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {rk.risk}
                          </h4>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-amber-500/15 space-y-2 text-xs">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              System Impact:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {rk.impact}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              Mitigation Strategy:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {rk.mitigation}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Architectural Trade-off:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {rk.tradeoff}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Section 11: Visual Architecture */}
            <Card id="diagram" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Workflow className="w-4 h-4" />
                  <span>11. Visual Architecture Preview</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {sections.visual_diagram.diagram_type}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {sections.visual_diagram.description}
                </p>

                <div className="p-3 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
                    <span>Mermaid.js DSL Specification</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded">
                      Phase 3B.4 Renderer Target
                    </span>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-indigo-300">
                    {sections.visual_diagram.mermaid_code}
                  </pre>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Regenerate Confirmation Modal */}
        <Modal
          isOpen={showRegenerateModal}
          onClose={() => !isRegenerating && setShowRegenerateModal(false)}
          title="Regenerate Architecture Blueprint"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Regenerating will synthesize a new architecture blueprint version (
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                v{(versions.length > 0 ? versions[0].version : 1) + 1}
              </span>
              ) based on the latest Workspace Specification.
            </p>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
              <p className="font-semibold">Versioning Protection:</p>
              <p className="text-[11px]">
                Your previous blueprint versions (v1..v{blueprint?.version}) will remain intact and accessible in the version dropdown.
              </p>
            </div>

            {generationError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                {generationError}
              </div>
            )}

            {isRegenerating ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                  <Spinner size="sm" />
                  <span>Synthesizing Architecture Blueprint...</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                  <p className={regenerateStep >= 1 ? 'text-emerald-600 font-semibold' : ''}>
                    {regenerateStep > 1 ? '✓' : '→'} Reading workspace specifications & boundaries
                  </p>
                  <p className={regenerateStep >= 2 ? 'text-emerald-600 font-semibold' : ''}>
                    {regenerateStep > 2 ? '✓' : regenerateStep === 2 ? '→' : '○'} Analyzing requirements & component interactions
                  </p>
                  <p className={regenerateStep >= 3 ? 'text-emerald-600 font-semibold' : ''}>
                    {regenerateStep > 3 ? '✓' : regenerateStep === 3 ? '→' : '○'} Formulating technology stack & ADR decisions
                  </p>
                  <p className={regenerateStep >= 4 ? 'text-emerald-600 font-semibold' : ''}>
                    {regenerateStep === 4 ? '✓' : '○'} Persisting new blueprint version
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
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
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Generate Version v{(versions.length > 0 ? versions[0].version : 1) + 1}
                </Button>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default BlueprintPage;
