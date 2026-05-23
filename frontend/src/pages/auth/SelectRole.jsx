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
    icon: '💻',
    perks: ['Upload unlimited plugins', 'Set custom pricing', 'Manage licenses', 'Revenue analytics'],
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
    border: 'rgba(245,158,11,0.35)',
    bg: 'rgba(245,158,11,0.07)',
  },
  {
    id: 'customer',
    title: 'Plugin Buyer',
    subtitle: 'Browse & buy premium plugins',
    description: 'Discover, purchase, and manage WordPress plugins from talented developers worldwide.',
    icon: '🛒',
    perks: ['Access plugin marketplace', 'Instant downloads', 'License management', 'Order history'],
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.2)',
    border: 'rgba(6,182,212,0.35)',
    bg: 'rgba(6,182,212,0.07)',
  },
];

export default function SelectRole() {
  const navigate = useNavigate();
  const { user, token, role, isAuthenticated, needsOnboarding, completeOnboarding } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated || !token) return <Navigate to="/login" replace />;
  if (isAuthenticated && !needsOnboarding) {
    const path = role === 'admin' ? '/admin/dashboard' : role === 'developer' ? '/developer/dashboard' : '/customer/dashboard';
    return <Navigate to={path} replace />;
  }

  const handleContinue = async () => {
    if (!selectedRole) { toast.error('Please select how you want to use PluginVault'); return; }
    if (selectedRole === 'developer' && !businessName.trim()) { toast.error('Please enter your business or developer name'); return; }
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>
      {/* Background orbs */}
      <div className="orb-amber" style={{ position: 'absolute', width: '600px', height: '600px', top: '-20%', left: '-20%', animation: 'orb-drift 14s ease-in-out infinite', opacity: 0.5 }} />
      <div className="orb-cyan"  style={{ position: 'absolute', width: '500px', height: '500px', bottom: '-20%', right: '-15%', animation: 'orb-drift 18s ease-in-out infinite reverse', opacity: 0.45 }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '680px', animation: 'fade-in 0.4s ease forwards' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 24px rgba(245,158,11,0.4)',
          }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#000', fontFamily: 'Syne, sans-serif' }}>PV</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: 'clamp(24px, 4vw, 32px)', color: 'var(--text-primary)', letterSpacing: '-0.04em', marginBottom: '8px' }}>
            Welcome to PluginVault
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', maxWidth: '380px', margin: '0 auto', lineHeight: '1.7' }}>
            {user?.name ? <><span style={{ color: 'var(--accent)', fontWeight: '600' }}>Hey {user.name.split(' ')[0]}!</span> </> : ''}
            How would you like to use PluginVault?{' '}
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>You can only choose one.</span>
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                style={{
                  borderRadius: '20px',
                  border: isSelected ? `1px solid ${role.border}` : '1px solid rgba(255,255,255,0.07)',
                  background: isSelected ? role.bg : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                  padding: '28px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isSelected ? `0 0 32px ${role.glow}, 0 0 0 1px ${role.border}` : 'none',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                {/* Selection ring indicator */}
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  width: '22px', height: '22px', borderRadius: '50%',
                  border: `2px solid ${isSelected ? role.color : 'rgba(255,255,255,0.12)'}`,
                  background: isSelected ? role.bg : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}>
                  {isSelected && (
                    <svg style={{ width: '12px', height: '12px', color: role.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Icon */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', marginBottom: '16px',
                  background: isSelected ? `${role.bg}` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSelected ? role.border : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px',
                  transition: 'all 0.2s ease',
                }}>
                  {role.icon}
                </div>

                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '18px', color: isSelected ? role.color : 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.03em' }}>
                  {role.title}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: '12px', fontWeight: '500' }}>
                  {role.subtitle}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.6', marginBottom: '16px' }}>
                  {role.description}
                </p>

                {/* Perks */}
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {role.perks.map((perk) => (
                    <li key={perk} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isSelected ? role.color : 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                      <svg style={{ width: '12px', height: '12px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {perk}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Business name field */}
        {selectedRole === 'developer' && (
          <div style={{ marginBottom: '20px', animation: 'fade-in 0.3s ease forwards' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Developer / Business Name <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Plugins, John Dev Studio"
              className="input-field"
            />
            <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              This will appear on your plugin listings.
            </p>
          </div>
        )}

        {/* Continue button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading || !selectedRole}
          className="btn-amber"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            fontSize: '15px',
            cursor: (loading || !selectedRole) ? 'not-allowed' : 'pointer',
            opacity: !selectedRole ? 0.4 : 1,
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg style={{ width: '16px', height: '16px', animation: 'spin-slow 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Setting up your account...
            </span>
          ) : selectedRole ? (
            `Continue as ${selectedRole === 'developer' ? 'Plugin Developer' : 'Plugin Buyer'} →`
          ) : (
            'Select a role to continue'
          )}
        </button>

        <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
          You can contact support if you need to change your role later.
        </p>
      </div>
    </div>
  );
}
