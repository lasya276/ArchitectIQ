import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { 
  ArrowLeft, 
  BookOpen, 
  Info, 
  Cpu, 
  Code2, 
  Database, 
  Sparkles, 
  FolderPlus,
  Workflow,
  Share2,
  Palette,
  Play
} from 'lucide-react';
import { AQLogo, AQMonogram } from '../components/brand/AQLogo';

export const DocsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'about' | 'docs'>('docs');
  const [activeDocSection, setActiveDocSection] = useState<string>('intro');

  const docSections = [
    { id: 'intro', label: '1. Introduction to ArchitectIQ', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'create-project', label: '2. How to Create a Project', icon: <FolderPlus className="w-3.5 h-3.5" /> },
    { id: 'wizard', label: '3. Requirement Discovery Wizard', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'blueprint', label: '4. Generate Architecture Blueprint', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'software-design', label: '5. Generate Software Design', icon: <Workflow className="w-3.5 h-3.5" /> },
    { id: 'diagrams', label: '6. Understanding ER, Class & Component Diagrams', icon: <Share2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <button
              id="back-to-dashboard-btn"
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 mt-0.5"
              title="Back to Projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Knowledge Base & System Info
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                About & Documentation
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comprehensive guide to ArchitectIQ workflows, architecture synthesis, and diagramming paradigms.
              </p>
            </div>
          </div>

          {/* Primary View Switcher Tabs */}
          <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            <button
              id="tab-docs"
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'docs'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Documentation</span>
            </button>
            <button
              id="tab-about"
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'about'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>About ArchitectIQ</span>
            </button>
          </div>
        </div>

        {/* -------------------- TAB 1: ABOUT ARCHITECTIQ -------------------- */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Product Overview Hero */}
            <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <AQMonogram size={56} variant="badge" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <AQLogo size="lg" />
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      Version 1.0.0 (Production)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    AI-powered software architecture planning and system design intelligence platform. Transforms high-level requirements into formal architecture blueprints, structured technical specifications, and low-level software designs.
                  </p>
                </div>
              </div>
            </Card>

            {/* Core Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Requirement Discovery</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Interactive multi-step questionnaire that extracts functional constraints, non-functional latency/scale parameters, and stakeholders.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Architecture Blueprints</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Automated synthesis of system topology, architectural trade-offs, technology stack selection, and deployment topologies with Gemini AI.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div className="w-8 h-8 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Workflow className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Visual Software Design</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Deep-dive software design synthesis with interactive Entity-Relationship (ER), Class, and Component diagrams rendered via Mermaid.js.
                </p>
              </div>
            </div>

            {/* Technologies Used Grid */}
            <Card
              title="Technologies Used"
              subtitle="The robust engineering stack powering ArchitectIQ"
              className="border-slate-200 dark:border-slate-800"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center gap-2 mb-1">
                    <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Frontend</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    React 18 · TypeScript · Vite · Tailwind CSS · Lucide Icons
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Backend</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    FastAPI · Python 3.11 · Pydantic v2 · Uvicorn
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Database</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    PostgreSQL · SQLAlchemy ORM · Alembic Migrations
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">AI & Engine</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Google Gemini 2.5 Flash · Mermaid.js v11 Diagrams
                  </p>
                </div>
              </div>
            </Card>

            {/* Official Brand Identity & AQ Monogram System */}
            <Card
              title="Official Brand Identity & AQ Monogram System"
              subtitle="The geometric foundation, color palette, and logo variations of ArchitectIQ"
              className="border-slate-200 dark:border-slate-800"
            >
              <div className="space-y-6 pt-1 text-xs">
                {/* Brand Story & Geometric Direction */}
                <div className="p-4 rounded-lg bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                      <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Core Design Concept: Custom Interlocking AQ Lettermark</span>
                    </div>
                    <button
                      type="button"
                      id="replay-intro-docs-button"
                      onClick={() => {
                        try {
                          sessionStorage.removeItem('architectiq_intro_seen');
                        } catch {
                          // Ignore
                        }
                        navigate('/?intro=replay');
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Replay Animated Intro</span>
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    The ArchitectIQ visual identity is a custom interlocking lettermark seamlessly interweaving the letters <strong>A</strong> and <strong>Q</strong>. The soaring apex of the <em>A</em> retains its clear architectural stance, precision symmetry, and lintel crossbar, while the circular form of the <em>Q</em> intertwines with optical over-and-under ribbon weaving behind A's right leg and sweeps out forward with an elegant curved tail. This creates a cohesive typographic symbol that conveys software intelligence and structural rigor.
                  </p>
                  <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase pt-1">
                    Official Tagline: "Where Ideas Become Architecture"
                  </div>
                </div>

                {/* 6 Official Variations Showcase Grid */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider text-[11px]">
                    Official Logo Variations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* 1. Primary Dark */}
                    <div className="p-3.5 rounded-lg bg-[#0B1428] border border-[#1F293D] flex flex-col justify-between gap-3">
                      <span className="text-[10px] font-mono text-slate-400">1. Primary Logo (Dark)</span>
                      <AQLogo size="sm" showTagline={false} wordmarkTheme="dark" />
                    </div>

                    {/* 2. Primary Light */}
                    <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex flex-col justify-between gap-3">
                      <span className="text-[10px] font-mono text-slate-500">2. Primary Logo (Light)</span>
                      <AQLogo size="sm" showTagline={false} wordmarkTheme="light" />
                    </div>

                    {/* 3. Standalone Symbol */}
                    <div className="p-3.5 rounded-lg bg-[#0B1428] border border-[#1F293D] flex flex-col justify-between gap-3">
                      <span className="text-[10px] font-mono text-slate-400">3. Standalone Symbol</span>
                      <div className="flex items-center gap-3">
                        <AQMonogram size={36} variant="gradient" />
                        <AQMonogram size={26} variant="gradient" />
                        <AQMonogram size={20} variant="gradient" />
                      </div>
                    </div>

                    {/* 4. Favicon / App Icon */}
                    <div className="p-3.5 rounded-lg bg-[#0B1428] border border-[#1F293D] flex flex-col justify-between gap-3">
                      <span className="text-[10px] font-mono text-slate-400">4. App Icon & Favicon</span>
                      <div className="flex items-center gap-3">
                        <AQMonogram size={36} variant="badge" />
                        <AQMonogram size={26} variant="badge" />
                        <AQMonogram size={18} variant="badge" />
                      </div>
                    </div>

                    {/* 5. Monochrome Versions */}
                    <div className="p-3.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">5. Monochrome Marks</span>
                      <div className="flex items-center gap-4">
                        <div className="p-1.5 rounded bg-[#0B1428]">
                          <AQMonogram size={24} variant="mono-white" />
                        </div>
                        <div className="p-1.5 rounded bg-white border border-slate-200">
                          <AQMonogram size={24} variant="mono-dark" />
                        </div>
                        <div className="p-1.5 rounded bg-slate-200 dark:bg-slate-800">
                          <AQMonogram size={24} variant="mono-blue" />
                        </div>
                      </div>
                    </div>

                    {/* 6. Lockup with Tagline */}
                    <div className="p-3.5 rounded-lg bg-[#0B1428] border border-[#1F293D] flex flex-col justify-between gap-3">
                      <span className="text-[10px] font-mono text-slate-400">6. Lockup + Tagline</span>
                      <AQLogo size="xs" showTagline={true} wordmarkTheme="dark" />
                    </div>
                  </div>
                </div>

                {/* Official Brand Palette */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2.5 text-xs uppercase tracking-wider text-[11px]">
                    Brand Color Palette
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                      <div className="w-full h-7 rounded bg-[#0B1428] border border-slate-700" />
                      <div className="font-semibold text-[11px] text-slate-900 dark:text-white">Midnight Navy</div>
                      <div className="font-mono text-[10px] text-slate-500">#0B1428</div>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                      <div className="w-full h-7 rounded bg-[#287BFF]" />
                      <div className="font-semibold text-[11px] text-slate-900 dark:text-white">Electric Blue</div>
                      <div className="font-mono text-[10px] text-slate-500">#287BFF</div>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                      <div className="w-full h-7 rounded bg-[#38D9F5]" />
                      <div className="font-semibold text-[11px] text-slate-900 dark:text-white">Cyan</div>
                      <div className="font-mono text-[10px] text-slate-500">#38D9F5</div>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                      <div className="w-full h-7 rounded bg-[#795BFF]" />
                      <div className="font-semibold text-[11px] text-slate-900 dark:text-white">Violet Accent</div>
                      <div className="font-mono text-[10px] text-slate-500">#795BFF</div>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                      <div className="w-full h-7 rounded bg-[#FFFFFF] border border-slate-200" />
                      <div className="font-semibold text-[11px] text-slate-900 dark:text-white">Pure White</div>
                      <div className="font-mono text-[10px] text-slate-500">#FFFFFF</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Credits and Acknowledgements */}
            <Card
              title="Credits & Acknowledgements"
              subtitle="Gratitude to open source foundations and AI infrastructure"
              className="border-slate-200 dark:border-slate-800"
            >
              <div className="space-y-3 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  ArchitectIQ is engineered with modern open standards and relies on foundational technologies developed by the software community:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-500 dark:text-slate-400 pl-2">
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Google Gemini Team & DeepMind</strong> – For the state-of-the-art Gemini LLM APIs powering high-precision system reasoning.
                  </li>
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Mermaid.js Authors & Maintainers</strong> – For the declarative Markdown-based SVG diagramming runtime.
                  </li>
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Tiangolo & FastAPI Community</strong> – For the lightning-fast Python async web framework.
                  </li>
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Lucide Icons</strong> – For the consistent, accessible vector iconography system.
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        )}

        {/* -------------------- TAB 2: DOCUMENTATION -------------------- */}
        {activeTab === 'docs' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Documentation Sidebar / Table of Contents */}
            <div className="md:col-span-1 space-y-1">
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                User Guide
              </div>
              {docSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveDocSection(section.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-left transition-colors ${
                    activeDocSection === section.id
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border-l-2 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="shrink-0">{section.icon}</span>
                  <span className="truncate">{section.label}</span>
                </button>
              ))}
            </div>

            {/* Documentation Content Area */}
            <div className="md:col-span-3 space-y-6">
              {/* Section 1: Intro */}
              {activeDocSection === 'intro' && (
                <Card
                  title="1. Introduction to ArchitectIQ"
                  subtitle="Overview of the core architecture planning philosophy"
                  className="border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                    <p>
                      <strong>ArchitectIQ</strong> is a specialized development environment designed to eliminate the architecture gap in modern software engineering. High-level business goals often get lost in translation during implementation, resulting in architectural drift, inconsistent APIs, and suboptimal tech stack decisions.
                    </p>
                    <p>
                      ArchitectIQ establishes an unbroken chain of custody from business requirements to production-ready design:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Phase 1</span>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">Elicitation</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Structured wizard capturing constraints, scalability goals, and target users.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Phase 2</span>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">Blueprint</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">High-level system topology, patterns, and architectural trade-offs.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">Phase 3</span>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">Software Design</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Component interfaces, database ER schemas, and class models.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Section 2: Create Project */}
              {activeDocSection === 'create-project' && (
                <Card
                  title="2. How to Create a Project"
                  subtitle="Initiating a new architectural workspace"
                  className="border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                    <p>
                      Creating a project sets up a dedicated workspace for all specifications, blueprints, and designs related to your system.
                    </p>
                    <ol className="list-decimal list-inside space-y-3 pl-1 text-xs">
                      <li className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">Navigate to Projects:</strong> Click <strong>Projects</strong> in the top navigation bar or the ArchitectIQ brand logo.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">Click "New Project":</strong> On the Projects Dashboard, click the blue <strong>+ New Project</strong> button.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">Choose Your Workflow:</strong> You can choose to launch the <em>Requirement Discovery Wizard</em> for guided AI-assisted discovery, or create a blank workspace specification to enter requirements directly.
                      </li>
                    </ol>
                  </div>
                </Card>
              )}

              {/* Section 3: Wizard */}
              {activeDocSection === 'wizard' && (
                <Card
                  title="3. How to Use the Requirement Discovery Wizard"
                  subtitle="Capturing rigorous technical requirements step by step"
                  className="border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                    <p>
                      The <strong>Requirement Discovery Wizard</strong> presents an adaptive multi-step questionnaire tailored to software systems.
                    </p>
                    <div className="space-y-2.5 pt-1">
                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
                        <h4 className="font-semibold text-slate-900 dark:text-white">1. Core Vision & Problem Statement</h4>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">Describe what problem the application solves, the primary value proposition, and intended domain.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
                        <h4 className="font-semibold text-slate-900 dark:text-white">2. Functional & Non-Functional Requirements</h4>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">Define core business workflows, target concurrency, acceptable p99 latency thresholds, and uptime SLA targets.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
                        <h4 className="font-semibold text-slate-900 dark:text-white">3. Constraints & Regulatory Scope</h4>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">Specify compliance requirements (GDPR, HIPAA, SOC 2), cloud providers (AWS, GCP, Azure, Bare-metal), and legacy constraints.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
                        <h4 className="font-semibold text-slate-900 dark:text-white">4. Review & Compilation</h4>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">Review captured responses. Submitting the wizard maps data directly into the 7 Workspace Specification sections.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Section 4: Blueprint */}
              {activeDocSection === 'blueprint' && (
                <Card
                  title="4. How to Generate an Architecture Blueprint"
                  subtitle="Transforming requirements into high-level architecture specifications"
                  className="border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                    <p>
                      The <strong>Architecture Blueprint</strong> serves as the system's structural foundation.
                    </p>
                    <ol className="list-decimal list-inside space-y-3 pl-1 text-xs">
                      <li className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">Open your Project Workspace:</strong> Navigate to <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">/workspace/:id</code>.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">Review & Refine 7 Sections:</strong> Ensure your Vision, Problem Statement, Requirements, Constraints, Business Goals, Stakeholders, and Target Users are accurate. Click <strong>Save Changes</strong>.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">Initiate Generation:</strong> Click the <strong>Generate Architecture</strong> button in the top action bar.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">Inspect Generated Blueprint:</strong> ArchitectIQ synthesizes system topology, pattern trade-offs, technology stack recommendations, and security architecture. Blueprints are version-tracked (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">v1, v2...</code>).
                      </li>
                    </ol>
                  </div>
                </Card>
              )}

              {/* Section 5: Software Design */}
              {activeDocSection === 'software-design' && (
                <Card
                  title="5. How to Generate Software Design"
                  subtitle="Synthesizing concrete components, schemas, and technical models"
                  className="border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                    <p>
                      While the Architecture Blueprint provides macroscopic system topology, <strong>Software Design</strong> decomposes modules into concrete code and data structures.
                    </p>
                    <ol className="list-decimal list-inside space-y-3 pl-1 text-xs">
                      <li className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">Open the Architecture Blueprint:</strong> On your project's blueprint page (<code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">/workspace/:id/blueprint</code>).
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">Click "Generate Software Design":</strong> ArchitectIQ's generator passes the blueprint context to synthesize component boundaries, API specifications, and relational tables.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">Interactive Inspection & Export:</strong> View component breakdowns, API specs, and interactive Mermaid diagrams. Use <strong>Export</strong> to download the complete design as a standalone Markdown document.
                      </li>
                    </ol>
                  </div>
                </Card>
              )}

              {/* Section 6: Diagrams */}
              {activeDocSection === 'diagrams' && (
                <Card
                  title="6. Understanding ER, Class and Component Diagrams"
                  subtitle="How to interpret and navigate ArchitectIQ visual models"
                  className="border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                    {/* ER Diagram Guide */}
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Entity-Relationship (ER) Diagrams
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        ER diagrams model database tables, primary keys, foreign key constraints, and relational cardinality.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-700 dark:text-slate-300 pt-1">
                        <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <strong>||--||</strong>: Exactly one to one
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <strong>||--o&#123;</strong>: One to zero-or-more
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <strong>&#125;o--o&#123;</strong>: Many to many
                        </div>
                      </div>
                    </div>

                    {/* Class Diagram Guide */}
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Class Diagrams
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Class diagrams express object-oriented abstractions, attributes, method signatures, and structural relationships.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-700 dark:text-slate-300 pt-1">
                        <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <strong>+</strong> Public
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <strong>-</strong> Private
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <strong>#</strong> Protected
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <strong>&lt;|--</strong> Inheritance
                        </div>
                      </div>
                    </div>

                    {/* Component Diagram Guide */}
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <Workflow className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Component Diagrams
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Component diagrams visualize runtime processes, microservice boundaries, load balancers, caching layers, message brokers, and inter-service communication protocols (REST, gRPC, Event-driven).
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DocsPage;
