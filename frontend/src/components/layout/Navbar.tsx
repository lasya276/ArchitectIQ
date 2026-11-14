import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { AQLogo } from '../brand/AQLogo';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" id="brand-logo" className="flex items-center group focus:outline-none">
          <AQLogo size="sm" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600 dark:text-slate-400">
          <a href="#features" id="nav-features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Capabilities
          </a>
          <a href="#how-it-works" id="nav-how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Planning Workflow
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link to="/login" id="nav-login-link">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register" id="nav-signup-link">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
