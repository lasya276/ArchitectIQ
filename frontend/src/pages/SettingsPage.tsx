import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Sun, 
  Moon, 
  Check, 
  Cpu, 
  Info, 
  Cookie, 
  Layers
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
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
                  Preferences & Security
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Account Settings
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure interface preferences, view security policies, and inspect active session configurations.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Appearance & Interface Preferences */}
        <Card
          title="Account Preferences"
          subtitle="Customize your workspace display mode and visual theme"
          className="border-slate-200 dark:border-slate-800"
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Interface Color Scheme
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                {/* Dark Mode Card */}
                <button
                  type="button"
                  id="theme-select-dark"
                  onClick={() => {
                    if (theme !== 'dark') toggleTheme();
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-lg border text-left transition-all ${
                    theme === 'dark'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-slate-900 text-amber-400 flex items-center justify-center border border-slate-700">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">Dark Theme</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Deep slate palette for low light</div>
                    </div>
                  </div>
                  {theme === 'dark' && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>

                {/* Light Mode Card */}
                <button
                  type="button"
                  id="theme-select-light"
                  onClick={() => {
                    if (theme !== 'light') toggleTheme();
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-lg border text-left transition-all ${
                    theme === 'light'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-white text-indigo-600 flex items-center justify-center border border-slate-200">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">Light Theme</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Clean, crisp paper-white contrast</div>
                    </div>
                  </div>
                  {theme === 'light' && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Account Security Information */}
        <Card
          title="Account Security"
          subtitle="Security posture, session integrity, and authentication mechanisms"
          className="border-slate-200 dark:border-slate-800"
        >
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <Cookie className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>HTTP-Only Cookie Storage</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Authentication tokens are stored in tamper-proof HTTP-Only cookies, isolated from client script execution to eliminate XSS token exfiltration.
                </p>
                <div className="pt-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> SameSite=Lax · Secure Flag Active
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Session Identity Validation</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Current session is authenticated as <strong className="text-slate-800 dark:text-slate-200">{user?.email || 'user@example.com'}</strong>. Validated via cryptographic signature on each API request.
                </p>
                <div className="pt-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  User ID: {user?.id || '—'}
                </div>
              </div>
            </div>

            {/* Password Management Notice */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Password Security & Management</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                    Bcrypt Hashed
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Your password is cryptographically hashed using salted Bcrypt before persistent storage. Self-service password changes are not enabled in this deployment release. Contact your system administrator for credential rotation.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Platform & Generation Specifications */}
        <Card
          title="System Architecture & Engines"
          subtitle="Underlying computation models and rendering specifications"
          className="border-slate-200 dark:border-slate-800"
        >
          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>AI Reasoning Core</span>
              </div>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Google Gemini API (2.5 Flash / Pro)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Diagramming Engine</span>
              </div>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Mermaid.js v11 (Client-side Vector SVG)
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Specification Export Format</span>
              </div>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                GitHub-Flavored Markdown (.md)
              </span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
