import React from 'react';
import { Link } from 'react-router-dom';
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
import { Card } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
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
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Software Planning Workspace</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Transform Rough Ideas into Complete <span className="gradient-text">Engineering Blueprints</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            ArchitectIQ is not a chatbot or code generator. It is a production-grade software planning workspace that structures, validates, and visualizes system design before writing code.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" id="hero-get-started">
              <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Launch Workspace
              </Button>
            </Link>
            <Link to="/login" id="hero-demo-login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Demo Project
              </Button>
            </Link>
          </div>

          {/* Feature Highlights Banner */}
          <div className="mt-16 flex items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Clean Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>RAG Knowledge Retrieval</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Explainable Engineering</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Mermaid & PlantUML Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for Rigorous Software Planning
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Combine AI reasoning, RAG vector context, static validation rules, and dynamic diagram generation into a unified workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <Card key={idx} glow className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How ArchitectIQ Works
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              A structured lifecycle guiding your team from idea submission to approved engineering specification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <span className="text-3xl font-black text-indigo-500/40 dark:text-indigo-400/30">
                  {step.step}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{step.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Build Engineering Blueprints?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-indigo-200/90 max-w-2xl mx-auto font-light">
            Stop guessing your system architecture. Start designing production-grade specifications today.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/register" id="cta-get-started">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Create Your First Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
