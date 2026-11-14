import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, 
  Mail, 
  Key, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft,
  Sliders,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formattedDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

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
                  Account Overview
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                My Profile
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your ArchitectIQ account details and authentication identity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
              onClick={() => navigate('/settings')}
            >
              Account Settings
            </Button>
          </div>
        </div>

        {/* Identity Overview Hero Card */}
        <Card className="border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-md shadow-blue-500/10 shrink-0">
              {initials}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {user?.name || 'Architect User'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50">
                  Software Architect
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{user?.email || 'user@example.com'}</span>
              </p>
              <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Joined {formattedDate(user?.created_at).split(' at')[0]}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Verified Session
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Data Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Personal Account Information */}
          <Card
            title="Account Information"
            subtitle="Your authenticated identity attributes"
            className="border-slate-200 dark:border-slate-800"
          >
            <div className="space-y-4 pt-1">
              <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Full Name</span>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {user?.name || 'Architect User'}
                </span>
              </div>

              <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Address</span>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 break-all text-right">
                  {user?.email || 'user@example.com'}
                </span>
              </div>

              <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Key className="w-3.5 h-3.5" />
                  <span>Account ID</span>
                </div>
                <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded truncate max-w-[180px]">
                  {user?.id || '—'}
                </span>
              </div>

              <div className="flex items-start justify-between py-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last Profile Update</span>
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  {formattedDate(user?.updated_at || user?.created_at)}
                </span>
              </div>
            </div>
          </Card>

          {/* Workspace & Security Privileges */}
          <Card
            title="Access & Privileges"
            subtitle="Platform roles and workspace capabilities"
            className="border-slate-200 dark:border-slate-800"
          >
            <div className="space-y-4 pt-1">
              <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Account Status
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active / Good Standing
                </span>
              </div>

              <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Architecture Synthesis
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Full Access (Gemini AI)
                </span>
              </div>

              <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Software Design Engine
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Enabled (Mermaid.js v11)
                </span>
              </div>

              <div className="flex items-start justify-between py-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Authentication Type
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  HTTP-Only JWT Cookie
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;

