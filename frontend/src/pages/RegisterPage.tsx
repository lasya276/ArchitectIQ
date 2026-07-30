import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Phase 1 UI behavior: Navigate directly to empty dashboard UI
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Top Bar Theme Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link to="/" id="signup-brand-logo" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Architect<span className="gradient-text">IQ</span>
          </span>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Create your software planning workspace account
        </p>
      </div>

      {/* Registration Card Container */}
      <Card className="w-full max-w-md shadow-xl border-slate-200/80 dark:border-slate-800/80">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="register-name-input"
            label="Full Name"
            type="text"
            placeholder="Alex Architect"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            id="register-email-input"
            label="Work Email Address"
            type="email"
            placeholder="alex@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            id="register-password-input"
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            id="register-submit-btn"
            type="submit"
            size="lg"
            className="w-full mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Workspace Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          Already have an account?{' '}
          <Link to="/login" id="register-login-link" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};
