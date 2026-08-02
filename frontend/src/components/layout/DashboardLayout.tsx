import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Layers, 
  FolderKanban, 
  FileText, 
  Activity, 
  GitBranch, 
  SlidersHorizontal, 
  Workflow, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User 
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const isWorkspaceActive = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/workspace');

  const navItems = [
    { label: 'Workspaces', icon: <FolderKanban className="w-4 h-4" />, path: '/dashboard', active: isWorkspaceActive },
    { label: 'Blueprints', icon: <FileText className="w-4 h-4" />, path: '#', active: false },
    { label: 'Health Scores', icon: <Activity className="w-4 h-4" />, path: '#', active: false },
    { label: 'Version Control', icon: <GitBranch className="w-4 h-4" />, path: '#', active: false },
    { label: 'Simulations', icon: <SlidersHorizontal className="w-4 h-4" />, path: '#', active: false },
    { label: 'Visual Diagrams', icon: <Workflow className="w-4 h-4" />, path: '#', active: false },
    { label: 'Settings', icon: <Settings className="w-4 h-4" />, path: '#', active: false },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          id="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <Link to="/" id="dash-logo" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
              Architect<span className="text-indigo-500">IQ</span>
            </span>
          </Link>
          <button
            id="close-sidebar-btn"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </div>
          {navItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.path !== '#') {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                item.active
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'Architect User'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'user@example.com'}
                </span>
              </div>
            </div>
            <button
              id="dash-logout-btn"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Layout Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Top Navigation Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="open-sidebar-btn"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-200 hidden sm:block">
              Software Planning Workspace
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Phase 2 Active
            </span>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
