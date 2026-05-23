import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth.store';
import PageHeader from '../../components/shared/PageHeader';

export default function DeveloperSettings() {
  const [profile, setProfile] = useState({ name: '', email: '', business_name: '', website: '', subscription_plan: 'free' });
  const [pluginCount, setPluginCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userId = useAuthStore(state => state.user?.id);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      const { count } = await supabase.from('plugins').select('*', { count: 'exact', head: true }).eq('developer_id', userId);
      
      if (data) {
        setProfile({
          name: data.name || '',
          email: data.email || '',
          business_name: data.business_name || '',
          website: data.website || '',
          subscription_plan: data.subscription_plan || 'free',
        });
        setPluginCount(count || 0);
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
      const { error } = await supabase.from('profiles').update({
        name: profile.name,
        business_name: profile.business_name,
        website: profile.website,
      }).eq('id', userId);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <PageHeader 
        title="Settings" 
        description="Configure account configurations, merchant metadata, and developer settings" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Settings Panel */}
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-border-subtle shadow-card card-accent-top space-y-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Profile Configuration</h2>
            <p className="text-xs text-text-secondary">Update your public profile details</p>
          </div>
          
          <div className="space-y-5">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 shimmer rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="input-field mt-1.5" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email} 
                      disabled
                      className="input-field mt-1.5 opacity-60 cursor-not-allowed bg-bg-surface/50 border-border-strong text-text-secondary" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Business Name</label>
                    <input 
                      type="text" 
                      value={profile.business_name} 
                      onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                      className="input-field mt-1.5" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Website URL</label>
                    <input 
                      type="url" 
                      value={profile.website} 
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="input-field mt-1.5 font-mono"
                      placeholder="https://example.com" 
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="btn-amber rounded-xl px-6 py-2.5 text-sm font-bold shadow-glow-sm hover:shadow-glow inline-flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving changes…
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6.5 rounded-3xl border border-border-subtle shadow-card card-accent-top space-y-4">
            <div>
              <h2 className="text-md font-bold text-text-primary">Developer Account</h2>
              <p className="text-xs text-text-secondary">Platform identity & signature</p>
            </div>
            
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className="text-text-secondary">Account Role</span>
                <span className="font-bold text-accent uppercase tracking-wider text-xs">Developer</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className="text-text-secondary">Seller Tier</span>
                <span className="font-bold text-text-primary uppercase text-xs">{profile.subscription_plan}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary">Account ID</span>
                <code className="text-xs font-mono text-text-secondary bg-bg-base/50 px-2 py-0.5 rounded border border-border-subtle">
                  {userId?.slice(0, 8)}...
                </code>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}