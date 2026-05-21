import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth.store';
import PageHeader from '../../components/shared/PageHeader';

export default function CustomerSettings() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userId = useAuthStore(state => state.user?.id);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfile({ name: data.name || '', email: data.email || '' });
      }
    } catch (error) {
      console.warn('Failed to fetch profile:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ name: profile.name }).eq('id', userId);
      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account settings" />

      <div className="rounded-xl border border-border-subtle bg-bg-card">
        <div className="border-b border-border-subtle px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Profile Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-12 animate-pulse rounded bg-bg-elevated" />)}</div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-text-secondary">Full Name</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary">Email</label>
                <input type="email" value={profile.email} disabled
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-muted cursor-not-allowed" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-card">
        <div className="border-b border-border-subtle px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Account Information</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border-subtle">
              <span className="text-text-secondary">Account Type</span>
              <span className="font-medium text-text-primary">Customer</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-subtle">
              <span className="text-text-secondary">User ID</span>
              <span className="font-mono text-sm text-text-muted">{userId?.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}