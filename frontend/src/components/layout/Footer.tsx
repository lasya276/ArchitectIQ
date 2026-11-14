import React from 'react';
import { AQLogo } from '../brand/AQLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="mb-3">
              <AQLogo size="sm" showTagline={true} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Software planning and architecture workspace for production-grade engineering specifications.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><a href="#features" className="hover:text-indigo-500 transition-colors">Workspace Features</a></li>
              <li><a href="#how-it-works" className="hover:text-indigo-500 transition-colors">Planning Workflow</a></li>
              <li><a href="#blueprint" className="hover:text-indigo-500 transition-colors">23 Blueprint Sections</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><span className="hover:text-indigo-500 cursor-pointer transition-colors">Architecture Standards</span></li>
              <li><span className="hover:text-indigo-500 cursor-pointer transition-colors">RAG Engineering Knowledge</span></li>
              <li><span className="hover:text-indigo-500 cursor-pointer transition-colors">System Design Templates</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">Legal</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><span className="hover:text-indigo-500 cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-indigo-500 cursor-pointer transition-colors">Terms of Service</span></li>
              <li><span className="hover:text-indigo-500 cursor-pointer transition-colors">Security Overview</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} ArchitectIQ Platform. All rights reserved.</p>
          <div className="mt-2 sm:mt-0 flex items-center gap-3">
            <button
              type="button"
              id="replay-intro-footer-button"
              onClick={() => {
                try {
                  sessionStorage.removeItem('architectiq_intro_seen');
                } catch {
                  // Ignore
                }
                window.dispatchEvent(new CustomEvent('architectiq_replay_intro'));
              }}
              className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-xs font-medium focus:outline-none"
              title="Replay the animated brand intro experience"
            >
              Replay Intro
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <p>Engineered for production-grade software architecture.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
