import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/auth.service';
import { getErrorMessage } from '../../services/api';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      // Browser navigates to Google
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast.error(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
    business_name: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!formData.name || formData.name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }
    setStep(2);
  };

  // Real-time numeric password check conditions
  const password = formData.password || '';
  const hasMinLength = password.length >= 8;
  const isOnlyNumbers = password.length > 0 && /^[0-9]+$/.test(password);

  const metCount = [hasMinLength, isOnlyNumbers].filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password) {
      toast.error('Please enter a password');
      return;
    }

    if (!hasMinLength) {
      toast.error('Password must be at least 8 digits long');
      return;
    }
    if (!isOnlyNumbers) {
      toast.error('Password must contain only numbers (0-9)');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        business_name: formData.business_name || '',
      });

      if (response.success) {
        toast.success('Account created! Please sign in.');
        navigate('/login');
      } else {
        if (response.error?.toLowerCase().includes('already')) {
          toast.error('Email already registered. Please sign in.');
          navigate('/login');
        } else {
          toast.error(response.error || 'Registration failed');
        }
      }

    } catch (error) {
      console.error('Registration error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Join PluginVault and start selling or buying WordPress plugins
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-accent' : 'bg-bg-elevated'}`} />
        <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-bg-elevated'}`} />
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">Full name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Continue
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border-subtle/50"></div>
            <span className="flex-shrink mx-4 text-text-muted text-xs uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-border-subtle/50"></div>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:bg-bg-elevated/80 hover:border-text-secondary/30 active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-text-secondary">Password</label>
              <span className="text-[11px] text-text-muted">Requires 8+ digits, numbers only (0-9)</span>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 pr-10 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Enter password digits"
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

            {/* Premium Interactive Numeric Password visualizer */}
            {formData.password && (
              <div className="mt-3 space-y-2 rounded-lg border border-border-subtle bg-bg-card/50 p-3.5 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-text-secondary">Password Strength:</span>
                    <span className={
                      metCount === 0 ? 'text-red-500 font-semibold' :
                      metCount === 1 ? 'text-yellow-500 font-semibold' :
                      'text-green-500 font-semibold'
                    }>
                      {metCount === 0 && 'Invalid ❌'}
                      {metCount === 1 && 'Fair ⚠️'}
                      {metCount === 2 && 'Strong ✨'}
                    </span>
                  </div>
                  <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-bg-elevated">
                    <div className={`h-full transition-all duration-300 ${
                      metCount === 0 ? 'bg-red-500 w-1/4' :
                      metCount === 1 ? 'bg-yellow-500 w-2/4' :
                      'bg-green-500 w-full'
                    }`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle/40">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      hasMinLength ? 'bg-green-500/10 text-green-500' : 'bg-bg-elevated text-text-muted'
                    }`}>
                      {hasMinLength ? '✓' : '•'}
                    </span>
                    <span className={hasMinLength ? 'text-green-500 font-medium' : 'text-text-secondary'}>
                      Min 8 digits
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      isOnlyNumbers ? 'bg-green-500/10 text-green-500' : 'bg-bg-elevated text-text-muted'
                    }`}>
                      {isOnlyNumbers ? '✓' : '•'}
                    </span>
                    <span className={isOnlyNumbers ? 'text-green-500 font-medium' : 'text-text-secondary'}>
                      Only numbers (0-9)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary">I want to...</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'developer' }))}
                className={`rounded-lg border p-4 text-left transition-all ${
                  formData.role === 'developer' 
                    ? 'border-accent bg-accent/10 text-accent font-medium shadow-sm shadow-accent/5' 
                    : 'border-border-subtle hover:bg-bg-elevated text-text-secondary'
                }`}
              >
                <div className="text-sm">Sell plugins</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
                className={`rounded-lg border p-4 text-left transition-all ${
                  formData.role === 'customer' 
                    ? 'border-accent bg-accent/10 text-accent font-medium shadow-sm shadow-accent/5' 
                    : 'border-border-subtle hover:bg-bg-elevated text-text-secondary'
                }`}
              >
                <div className="text-sm">Buy plugins</div>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-lg border border-border-subtle px-4 py-2.5 text-sm font-medium hover:bg-bg-elevated transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 hover:bg-accent-hover transition-colors"
            >
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent hover:underline">Sign in</Link>
      </p>
    </div>
  );
}