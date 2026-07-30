import React from 'react';
import { Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">ArchitectIQ</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              AI-Powered Software Planning Workspace translating ideas into production-grade engineering blueprints.
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
          <p className="mt-2 sm:mt-0">Engineered for production-grade software architecture.</p>
        </div>
      </div>
    </footer>
  );
};
