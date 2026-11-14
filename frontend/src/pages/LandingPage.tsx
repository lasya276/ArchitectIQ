import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  GitCompare, 
  Activity, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { AnimatedIntro, INTRO_SESSION_KEY } from '../components/brand/AnimatedIntro';

export const LandingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('intro') === 'replay') return true;
      const seen = sessionStorage.getItem(INTRO_SESSION_KEY);
      if (seen === 'true') return false;
      const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      return !prefersReduced;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // If intro query parameter is present, clean it up from URL after activating
    if (searchParams.get('intro') === 'replay') {
      searchParams.delete('intro');
      setSearchParams(searchParams, { replace: true });
    }

    const handleReplayEvent = () => {
      setShowIntro(true);
    };

    window.addEventListener('architectiq_replay_intro', handleReplayEvent);
    return () => {
      window.removeEventListener('architectiq_replay_intro', handleReplayEvent);
    };
  }, [searchParams, setSearchParams]);
  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-indigo-500" />,
      title: "Workflow-Driven AI Planning",
      description: "Embedded AI that guides you step-by-step through software design instead of an unstructured chatbot prompt window."
    },
    {
      icon: <Layers className="w-6 h-6 text-purple-500" />,
      title: "RAG Grounded Intelligence",
      description: "Grounded in verified software engineering knowledge bases to eliminate hallucinations in tech stack & architectural choices."
    },
    {
      icon: <FileText className="w-6 h-6 text-pink-500" />,
      title: "23 Independent Blueprint Sections",
      description: "Generates complete specifications from Database Design to Security Strategy, editable and regeneratable independently."
    },
    {
      icon: <Activity className="w-6 h-6 text-emerald-500" />,
      title: "Architectural Health Score",
      description: "Calculates an automated 0–100 quality score by evaluating static engineering rules and consistency cross-checks."
    },
    {
      icon: <GitCompare className="w-6 h-6 text-cyan-500" />,
      title: "What-If Scenario Simulation",
      description: "Test constraint changes—like switching databases or scaling concurrency—to evaluate trade-offs before writing code."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
      title: "Selective Visual Diagrams",
      description: "Synthesize vector SVG architecture diagrams using Mermaid.js and PlantUML derived directly from your blueprint."
    }
  ];

  const workflowSteps = [
    { step: "01", title: "Create Project Workspace", desc: "Define your high-level project vision, target domain, and constraints." },
    { step: "02", title: "AI Requirements Gap Analysis", desc: "ArchitectIQ analyzes your idea and asks targeted technical follow-up questions." },
    { step: "03", title: "RAG & AI Blueprint Synthesis", desc: "Gemini API and RAG generate 23 granular, independent blueprint sections." },
    { step: "04", title: "Review, Simulate & Export", desc: "Audit health scores, run what-if simulations, and generate UML diagrams." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Cinematic Animated Intro (Plays on initial session visit or manual replay) */}
      {showIntro && (
        <AnimatedIntro
          onComplete={() => setShowIntro(false)}
          forcePlay={true}
        />
      )}

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>AI-Powered Software Planning Workspace</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
            Transform Software Ideas into Complete <span className="text-blue-600 dark:text-blue-400">Engineering Blueprints</span>
          </h1>

          {/* Subheading */}
          <p className="mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            ArchitectIQ is a structured software architecture and planning workspace that formulates, validates, and visualizes system design before writing code.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" id="hero-get-started">
              <Button size="md" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Workspace
              </Button>
            </Link>
            <Link to="/login" id="hero-demo-login">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Feature Highlights Banner */}
          <div className="mt-12 flex items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500 dark:text-slate-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Clean Architecture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Technology Grounding</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Structured ADR Decisions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Mermaid UML Diagrams</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Engineered for Rigorous Software Planning
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Combine requirement discovery, architectural reasoning, and dynamic diagram generation into a unified workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, idx) => (
              <div key={idx} className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2.5">
                <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Planning Workflow
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              A structured progression from project vision to approved engineering blueprint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {step.step}
                </span>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{step.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-14 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to Plan System Architecture?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Create your first workspace and start structuring engineering specifications.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/register" id="cta-get-started">
              <Button size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
