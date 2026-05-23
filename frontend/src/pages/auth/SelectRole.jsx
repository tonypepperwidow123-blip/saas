import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';

const roles = [
  {
    id: 'developer',
    title: 'Plugin Developer',
    subtitle: 'Sell plugins & earn revenue',
    description: 'Upload your WordPress plugins, set pricing, manage licenses, and track revenue from your customer base.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    perks: ['Upload unlimited plugins', 'Set custom pricing', 'Manage licenses', 'Revenue analytics'],
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    accentColor: 'text-violet-400',
    borderActive: 'border-violet-500/60',
    bgActive: 'bg-violet-500/10',
    checkColor: 'text-violet-400',
    ringColor: 'ring-violet-500/30',
  },
  {
    id: 'customer',
    title: 'Plugin Buyer',
    subtitle: 'Browse & buy premium plugins',
    description: 'Discover, purchase, and manage WordPress plugins from talented developers worldwide.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    perks: ['Access plugin marketplace', 'Instant downloads', 'License management', 'Order history'],
    gradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
    accentColor: 'text-sky-400',
    borderActive: 'border-sky-500/60',
    bgActive: 'bg-sky-500/10',
    checkColor: 'text-sky-400',
    ringColor: 'ring-sky-500/30',
  },
];

export default function SelectRole() {
  const navigate = useNavigate();
  const { user, token, role, isAuthenticated, needsOnboarding, completeOnboarding } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);

  // Not logged in → go to login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // Already set up → skip onboarding, go straight to dashboard
  if (isAuthenticated && !needsOnboarding) {
    const path = role === 'admin' ? '/admin/dashboard'
               : role === 'developer' ? '/developer/dashboard'
               : '/customer/dashboard';
    return <Navigate to={path} replace />;
  }

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error('Please select how you want to use PluginVault');
      return;
    }

    if (selectedRole === 'developer' && !businessName.trim()) {
      toast.error('Please enter your business or developer name');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.setupRole(selectedRole, businessName.trim());

      if (res?.success && res.data?.user) {
        completeOnboarding(res.data.user);
        toast.success(`Welcome to PluginVault! You're set up as a ${selectedRole === 'developer' ? 'Plugin Developer' : 'Plugin Buyer'}.`);
        navigate(selectedRole === 'developer' ? '/developer/dashboard' : '/customer/dashboard', { replace: true });
      } else {
        toast.error(res?.error || 'Failed to save your selection. Please try again.');
      }
    } catch (err) {
      console.error('Role setup error:', err);
      toast.error(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-base flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      {/* Animated background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-accent/5 blur-2xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/30">
            <span className="text-xl font-bold text-white">PV</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Welcome to PluginVault
          </h1>
          <p className="text-text-secondary text-center max-w-sm">
            {user?.name ? `Hey ${user.name.split(' ')[0]}! ` : ''}
            How would you like to use PluginVault?
            <br />
            <span className="text-text-muted text-sm">You can only choose one — choose wisely!</span>
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`group relative flex flex-col gap-4 rounded-2xl border p-6 text-left transition-all duration-300 cursor-pointer
                  ${isSelected
                    ? `${role.borderActive} ${role.bgActive} ring-2 ${role.ringColor} shadow-xl scale-[1.02]`
                    : 'border-border-subtle bg-bg-card hover:border-border-subtle/80 hover:bg-bg-elevated hover:scale-[1.01]'
                  }`}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${role.gradient} opacity-0 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'group-hover:opacity-50'}`} />

                {/* Selection indicator */}
                <div className={`absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200
                  ${isSelected ? `${role.borderActive} ${role.bgActive}` : 'border-border-subtle bg-bg-elevated'}`}>
                  {isSelected && (
                    <svg className={`h-3.5 w-3.5 ${role.checkColor}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <div className="relative">
                  {/* Icon */}
                  <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-xl border transition-colors duration-200
                    ${isSelected ? `${role.bgActive} ${role.borderActive} ${role.accentColor}` : 'bg-bg-elevated border-border-subtle text-text-secondary'}`}>
                    {role.icon}
                  </div>

                  {/* Title & subtitle */}
                  <h2 className={`text-lg font-bold transition-colors ${isSelected ? role.accentColor : 'text-text-primary'}`}>
                    {role.title}
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-text-secondary">{role.subtitle}</p>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">{role.description}</p>

                  {/* Perks */}
                  <ul className="mt-4 space-y-1.5">
                    {role.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-xs text-text-secondary">
                        <svg className={`h-4 w-4 flex-shrink-0 ${isSelected ? role.checkColor : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>

        {/* Developer: business name field */}
        {selectedRole === 'developer' && (
          <div className="mt-5 transition-all duration-200">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Developer / Business Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Plugins, John Dev Studio"
              className="w-full rounded-xl border border-border-subtle bg-bg-card px-4 py-3 text-text-primary placeholder-text-muted focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            <p className="mt-1.5 text-xs text-text-muted">This will appear on your plugin listings.</p>
          </div>
        )}

        {/* Continue button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading || !selectedRole}
          className={`mt-6 w-full rounded-xl px-6 py-3.5 text-base font-semibold text-white transition-all duration-200
            ${selectedRole
              ? 'bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-bg-elevated text-text-muted cursor-not-allowed'
            }
            disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Setting up your account...
            </span>
          ) : selectedRole ? (
            `Continue as ${selectedRole === 'developer' ? 'Plugin Developer' : 'Plugin Buyer'} →`
          ) : (
            'Select a role to continue'
          )}
        </button>

        <p className="mt-4 text-center text-xs text-text-muted">
          You can contact support if you need to change your role later.
        </p>
      </div>
    </div>
  );
}
