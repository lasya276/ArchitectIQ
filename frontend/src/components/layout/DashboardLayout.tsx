import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User,
  Settings,
  BookOpen,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AQLogo } from '../brand/AQLogo';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle keyboard navigation: close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleLogout = async () => {
    try {
      setShowSignOutConfirm(false);
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleNavigate = (path: string) => {
    setIsDrawerOpen(false);
    navigate(path);
  };

  // Detect project workspace context
  const workspaceMatch = location.pathname.match(/\/workspace\/([^/]+)/);
  const currentProjectId = workspaceMatch ? workspaceMatch[1] : null;
  const isBlueprint = location.pathname.endsWith('/blueprint');
  const isSoftwareDesign = location.pathname.endsWith('/software-design');
  const isWorkspaceOverview = currentProjectId && !isBlueprint && !isSoftwareDesign;
  const isDashboard = location.pathname === '/dashboard';
  const isWizard = location.pathname === '/wizard';
  const isProfile = location.pathname === '/profile';
  const isSettings = location.pathname === '/settings';
  const isDocs = location.pathname === '/docs' || location.pathname === '/documentation';

  // Compute initials for user avatar
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-[#0B0F19] text-[#17191C] dark:text-[#F3F4F6]">
      {/* 2. Modern Top Navigation Bar */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-[#111622]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#1F293D] px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Side: Brand Logo and Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* ArchitectIQ Logo and Brand Name */}
          <Link
            to="/dashboard"
            id="dash-logo"
            className="flex items-center shrink-0 group focus:outline-none"
            title="ArchitectIQ - Workspaces"
          >
            <AQLogo size="xs" />
          </Link>

          {/* Breadcrumbs separator */}
          <span className="text-slate-300 dark:text-slate-700 select-none">/</span>

          {/* Breadcrumbs or current page information */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 min-w-0 text-xs">
            {isDashboard && (
              <span className="text-slate-900 dark:text-slate-200 font-medium truncate">
                Projects
              </span>
            )}

            {isWizard && (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors truncate hidden sm:inline"
                >
                  Projects
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
                <span className="text-slate-900 dark:text-slate-200 font-medium truncate">
                  New Project Wizard
                </span>
              </>
            )}

            {currentProjectId && (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors truncate hidden sm:inline"
                >
                  Projects
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
                {isWorkspaceOverview && (
                  <span className="text-slate-900 dark:text-slate-200 font-medium truncate">
                    Workspace Specification
                  </span>
                )}
                {isBlueprint && (
                  <>
                    <Link
                      to={`/workspace/${currentProjectId}`}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors truncate hidden md:inline"
                    >
                      Workspace
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden md:inline" />
                    <span className="text-slate-900 dark:text-slate-200 font-medium truncate">
                      Architecture Blueprint
                    </span>
                  </>
                )}
                {isSoftwareDesign && (
                  <>
                    <Link
                      to={`/workspace/${currentProjectId}`}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors truncate hidden md:inline"
                    >
                      Workspace
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden md:inline" />
                    <span className="text-slate-900 dark:text-slate-200 font-medium truncate">
                      Software Design
                    </span>
                  </>
                )}
              </>
            )}

            {isProfile && (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors truncate hidden sm:inline"
                >
                  Projects
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
                <span className="text-slate-900 dark:text-slate-200 font-medium truncate">
                  My Profile
                </span>
              </>
            )}

            {isSettings && (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors truncate hidden sm:inline"
                >
                  Projects
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
                <span className="text-slate-900 dark:text-slate-200 font-medium truncate">
                  Account Settings
                </span>
              </>
            )}

            {isDocs && (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors truncate hidden sm:inline"
                >
                  Projects
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
                <span className="text-slate-900 dark:text-slate-200 font-medium truncate">
                  About & Documentation
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Right Side: Theme Toggle & Hamburger Menu Icon */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          
          {/* Hamburger Menu Icon (Three horizontal lines) */}
          <button
            id="open-sidebar-btn"
            aria-label="Open navigation drawer"
            title="Open navigation menu"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 3. Hamburger Menu Drawer Backdrop Overlay */}
      <div
        id="sidebar-backdrop"
        onClick={() => setIsDrawerOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* 3. Hamburger Menu Navigation Drawer (Sliding in from Left) */}
      <aside
        id="navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Drawer"
        className={`fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[300px] max-w-[85vw] bg-white dark:bg-[#111622] border-r border-slate-200 dark:border-[#1F293D] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header with Clear Close Button */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-[#1F293D] shrink-0">
          <Link
            to="/dashboard"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center focus:outline-none"
          >
            <AQLogo size="xs" />
          </Link>
          <button
            id="close-sidebar-btn"
            aria-label="Close navigation drawer"
            title="Close menu"
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Menu Items: Exactly the 4 main options */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menu
          </div>

          {/* Option 1: My Profile */}
          <button
            id="drawer-nav-profile"
            onClick={() => handleNavigate('/profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isProfile
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>My Profile</span>
          </button>

          {/* Option 2: Account Settings */}
          <button
            id="drawer-nav-settings"
            onClick={() => handleNavigate('/settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isSettings
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>Account Settings</span>
          </button>

          {/* Option 3: About & Documentation */}
          <button
            id="drawer-nav-docs"
            onClick={() => handleNavigate('/docs')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isDocs
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>About & Documentation</span>
          </button>
        </div>

        {/* Option 4: Sign Out - Visually distinct action near bottom */}
        <div className="px-3 pt-2 pb-2 border-t border-slate-200/80 dark:border-[#1F293D] shrink-0">
          <button
            id="dash-logout-btn"
            onClick={() => {
              setIsDrawerOpen(false);
              setShowSignOutConfirm(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* 4. Compact Account Information at the Bottom */}
        <div className="p-3.5 border-t border-slate-200 dark:border-[#1F293D] bg-slate-50/70 dark:bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.name || 'Architect User'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'user@example.com'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* 1. Main Content Area Occupying Full Available Screen Width */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto">
        {children}
      </main>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <Modal
          isOpen={showSignOutConfirm}
          onClose={() => setShowSignOutConfirm(false)}
          title="Confirm Sign Out"
          footer={
            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSignOutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Sign Out
              </Button>
            </div>
          }
        >
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <p>
              Are you sure you want to sign out of <strong>ArchitectIQ</strong>?
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Your active workspace session will be safely cleared. Any saved projects and generated blueprints remain securely stored in your account.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DashboardLayout;
