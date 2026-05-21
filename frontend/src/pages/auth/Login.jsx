import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import { getErrorMessage } from '../../services/api';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Real-time password requirement checkers
  const hasMinLength = password.length >= 8;
  const isOnlyNumbers = password.length > 0 && /^[0-9]+$/.test(password);
  const isPasswordValid = hasMinLength && isOnlyNumbers;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.success && response.data) {
        const { user, token } = response.data;

        setAuth(user, token);

        let redirectPath = '/customer/dashboard';
        if (user.role === 'admin') redirectPath = '/admin/dashboard';
        else if (user.role === 'developer') redirectPath = '/developer/dashboard';

        toast.success(`Welcome, ${user.name}!`);
        navigate(redirectPath, { replace: true });
      } else {
        toast.error(response.error || 'Login failed');
      }

    } catch (err) {
      console.error('Login error:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Sign in to your PluginVault account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-accent hover:text-accent-hover"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`block w-full rounded-lg border bg-bg-elevated px-4 py-2.5 pr-10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 transition-all ${
                password && !isPasswordValid
                  ? 'border-amber-500/40 focus:border-amber-500 focus:ring-amber-500/20'
                  : 'border-border-subtle focus:border-accent focus:ring-accent'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary focus:outline-none"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {password && !isPasswordValid && (
            <div className="mt-2 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 space-y-1">
              <p className="font-semibold flex items-center gap-1 text-amber-300">
                <span>⚠️</span> Need help? Password guidelines:
              </p>
              <p className="text-text-secondary leading-normal">
                Passwords on PluginVault must be at least <strong>8 digits</strong> long, and contain only <strong>numbers (0-9)</strong>.
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
          Create one
        </Link>
      </p>
    </div>
  );
}