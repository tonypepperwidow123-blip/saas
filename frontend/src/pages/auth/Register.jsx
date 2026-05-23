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
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'developer', business_name: '',
  });

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast.error(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!formData.name || formData.name.length < 2) { toast.error('Name must be at least 2 characters'); return; }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) { toast.error('Please enter a valid email'); return; }
    setStep(2);
  };

  // Real-time password checks
  const password = formData.password || '';
  const hasMinLength = password.length >= 8;
  const isOnlyNumbers = password.length > 0 && /^[0-9]+$/.test(password);
  const metCount = [hasMinLength, isOnlyNumbers].filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password) { toast.error('Please enter a password'); return; }
    if (!hasMinLength) { toast.error('Password must be at least 8 digits long'); return; }
    if (!isOnlyNumbers) { toast.error('Password must contain only numbers (0-9)'); return; }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '24px', color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '6px' }}>
          Create your account
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
          Join PluginVault and start selling or buying WordPress plugins
        </p>
      </div>

      {/* Step progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
        {[1, 2].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: s <= step ? (s === step ? '28px' : '28px') : '28px',
              height: '28px',
              borderRadius: '50%',
              background: s < step ? 'linear-gradient(135deg, #f59e0b, #d97706)' : s === step ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
              border: s <= step ? '1.5px solid rgba(245,158,11,0.5)' : '1.5px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700',
              color: s < step ? '#000' : s === step ? '#f59e0b' : 'var(--text-muted)',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.3s ease',
            }}>
              {s < step ? (
                <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : s}
            </div>
            {s < 2 && (
              <div style={{
                width: '40px', height: '2px', borderRadius: '1px',
                background: step > s ? 'linear-gradient(90deg, #f59e0b, rgba(245,158,11,0.3))' : 'rgba(255,255,255,0.06)',
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Full name
            </label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange}
              className="input-field" placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email address
            </label>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              className="input-field" placeholder="you@example.com"
            />
          </div>

          <button
            type="button" onClick={handleNext}
            className="btn-amber"
            style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
          >
            Continue →
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Google */}
          <button
            type="button" disabled={loading} onClick={handleGoogleSignIn}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              width: '100%', padding: '11px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
              fontSize: '14px', fontWeight: '500', fontFamily: 'DM Sans, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                8+ digits, numbers only (0-9)
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password" value={formData.password} onChange={handleChange}
                className="input-field" placeholder="Enter password digits"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPassword
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    : <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </>
                  }
                </svg>
              </button>
            </div>

            {/* Strength visualizer */}
            {formData.password && (
              <div style={{
                marginTop: '10px', padding: '12px 14px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                {/* Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Password Strength</span>
                    <span style={{ color: metCount === 2 ? '#10b981' : metCount === 1 ? '#f59e0b' : '#f43f5e', fontWeight: '600' }}>
                      {metCount === 0 ? '✗ Invalid' : metCount === 1 ? '⚡ Fair' : '✦ Strong'}
                    </span>
                  </div>
                  <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: metCount === 0 ? '15%' : metCount === 1 ? '50%' : '100%',
                      borderRadius: '2px',
                      background: metCount === 0 ? '#f43f5e' : metCount === 1 ? '#f59e0b' : '#10b981',
                      transition: 'all 0.4s ease',
                      boxShadow: metCount === 2 ? '0 0 6px rgba(16,185,129,0.5)' : 'none',
                    }} />
                  </div>
                </div>
                {/* Requirements */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[{ met: hasMinLength, label: 'Min 8 digits' }, { met: isOnlyNumbers, label: 'Only numbers' }].map(({ met, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif', color: met ? '#10b981' : 'var(--text-muted)' }}>
                      <div style={{
                        width: '14px', height: '14px', borderRadius: '50%',
                        background: met ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${met ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '9px', fontWeight: '700', flexShrink: 0,
                      }}>
                        {met ? '✓' : '·'}
                      </div>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              I want to...
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { value: 'developer', label: 'Sell plugins', emoji: '💻' },
                { value: 'customer',  label: 'Buy plugins',  emoji: '🛒' },
              ].map((opt) => {
                const isSelected = formData.role === opt.value;
                return (
                  <button
                    key={opt.value} type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: opt.value }))}
                    style={{
                      padding: '14px 12px',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '6px' }}>{opt.emoji}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: isSelected ? '#f59e0b' : 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                      {opt.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Back + Submit */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button" onClick={() => setStep(1)}
              className="btn-ghost"
              style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}
            >
              ← Back
            </button>
            <button
              type="submit" disabled={loading}
              className="btn-amber"
              style={{ flex: 2, padding: '12px', borderRadius: '12px', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      )}

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}