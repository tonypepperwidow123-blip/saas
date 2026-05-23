import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/auth.service';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
        <div>
          {/* Success icon */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 16px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16,185,129,0.2)',
          }}>
            <svg style={{ width: '24px', height: '24px', color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '22px', color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
            Check your email
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.6' }}>
            If an account exists with that email, we've sent password reset instructions.
          </p>
        </div>
        <Link
          to="/login"
          className="btn-amber"
          style={{ display: 'block', padding: '12px', borderRadius: '12px', fontSize: '14px', textAlign: 'center', textDecoration: 'none' }}
        >
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 16px',
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px',
        }}>
          🔐
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '24px', color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
          Reset your password
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
          Enter your email and we'll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-amber"
          style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Sending...' : 'Send reset instructions'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
        Remember your password?{' '}
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}