import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Top Bar Theme Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link to="/" id="login-brand-logo" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Architect<span className="gradient-text">IQ</span>
          </span>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sign in to your Software Planning Workspace
        </p>
      </div>

      {/* Login Card Container */}
      <Card className="w-full max-w-md shadow-xl border-slate-200/80 dark:border-slate-800/80">
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email-input"
            label="Email Address"
            type="email"
            placeholder="architect@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            id="login-password-input"
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span>Remember me</span>
            </label>
            <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>

          <Button
            id="login-submit-btn"
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Workspace
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          Don't have a workspace account?{' '}
          <Link to="/register" id="login-signup-link" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
