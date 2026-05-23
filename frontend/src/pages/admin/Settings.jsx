import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminService } from '../../services/admin.service';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

const supabaseMutate = async (endpoint, method = 'DELETE', body = null) => {
  try {
    const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    let data;
    try { data = await response.json(); } catch (e) { data = null; }
    if (!response.ok) return { error: data?.message || 'Operation failed' };
    return { success: true, data };
  } catch (error) {
    return { error: error.message };
  }
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [platformSettings, setPlatformSettings] = useState({
    platform_name: 'PluginVault',
    platform_email: 'admin@pluginvault.com',
    allow_registrations: true,
    require_plugin_approval: true,
    enable_payments: false,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.warn('Failed to fetch stats:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllData = async (tableName) => {
    if (!confirm(`Are you sure you want to delete ALL data from ${tableName}? This cannot be undone!`)) return;
    if (!confirm(`Final confirmation: This will permanently delete ALL records from ${tableName}. Continue?`)) return;

    setDeleting(tableName);
    try {
      const result = await supabaseMutate(`/${tableName}`, 'DELETE');
      if (result.error) throw new Error(result.error);
      toast.success(`${tableName} data cleared`);
      fetchStats();
    } catch (error) {
      toast.error(`Failed to clear ${tableName}: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-display">System Settings</h1>
          <p className="text-xs text-text-secondary mt-0.5">Platform configuration, system information, and database control</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={loading ? '...' : stats?.users?.total || 0} loading={loading} />
        <StatCard title="Developers" value={loading ? '...' : stats?.users?.developers || 0} loading={loading} />
        <StatCard title="Plugins" value={loading ? '...' : stats?.plugins?.total || 0} loading={loading} />
        <StatCard title="Total Revenue" value={stats?.revenue?.total || 0} currency loading={loading} />
      </div>

      {/* Platform Settings */}
      <div className="glass-card overflow-hidden border border-border-subtle shadow-card card-accent-top">
        <div className="border-b border-border-subtle bg-bg-surface/40 px-6 py-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">Platform Preferences</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Platform Name</label>
              <input
                type="text"
                value={platformSettings.platform_name}
                onChange={(e) => setPlatformSettings({ ...platformSettings, platform_name: e.target.value })}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Contact Email</label>
              <input
                type="email"
                value={platformSettings.platform_email}
                onChange={(e) => setPlatformSettings({ ...platformSettings, platform_email: e.target.value })}
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={platformSettings.allow_registrations}
                onChange={(e) => setPlatformSettings({ ...platformSettings, allow_registrations: e.target.checked })}
                className="h-4.5 w-4.5 rounded border-border-subtle bg-bg-surface text-accent focus:ring-accent transition-colors"
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Allow new user registrations</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={platformSettings.require_plugin_approval}
                onChange={(e) => setPlatformSettings({ ...platformSettings, require_plugin_approval: e.target.checked })}
                className="h-4.5 w-4.5 rounded border-border-subtle bg-bg-surface text-accent focus:ring-accent transition-colors"
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Require administrator approval for plugins</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={platformSettings.enable_payments}
                onChange={(e) => setPlatformSettings({ ...platformSettings, enable_payments: e.target.checked })}
                className="h-4.5 w-4.5 rounded border-border-subtle bg-bg-surface text-accent focus:ring-accent transition-colors"
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Enable payment gateway processing (Razorpay)</span>
            </label>
          </div>

          <div className="pt-2 border-t border-border-subtle">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="btn-amber px-6 py-2.5 rounded-xl text-sm font-semibold shadow-glow-sm hover:shadow-glow transition-all"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Database Management */}
      <div className="glass-card overflow-hidden border border-border-subtle shadow-card card-accent-top">
        <div className="border-b border-border-subtle bg-bg-surface/40 px-6 py-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">Database & Records</h2>
          <p className="text-xs text-text-secondary mt-0.5">Manage entity registries and access administrative modules</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Users Row */}
            <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-white/[0.01] p-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">User Accounts</h3>
                <p className="text-xs text-text-muted mt-0.5">{stats?.users?.total || 0} registered profiles ({stats?.users?.developers || 0} developers, {stats?.users?.customers || 0} customers)</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/admin/developers')}
                  className="rounded-lg border border-accent/25 bg-accent-dim/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-black transition-all"
                >
                  Developers
                </button>
                <button
                  onClick={() => navigate('/admin/customers')}
                  className="rounded-lg border border-accent/25 bg-accent-dim/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-black transition-all"
                >
                  Customers
                </button>
              </div>
            </div>

            {/* Plugins Row */}
            <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-white/[0.01] p-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Plugins Registry</h3>
                <p className="text-xs text-text-muted mt-0.5">{stats?.plugins?.total || 0} products listed ({stats?.plugins?.pending || 0} pending approval review)</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/admin/plugins')}
                  className="rounded-lg border border-accent2/25 bg-accent2-dim/15 px-3 py-1.5 text-xs font-semibold text-accent2 hover:bg-accent2 hover:text-black transition-all"
                >
                  View All
                </button>
                <button
                  onClick={() => navigate('/admin/pending-approvals')}
                  className="rounded-lg border border-warning/25 bg-warning-dim/15 px-3 py-1.5 text-xs font-semibold text-warning hover:bg-warning hover:text-black transition-all"
                >
                  Pending ({stats?.plugins?.pending || 0})
                </button>
              </div>
            </div>

            {/* Orders Row */}
            <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-white/[0.01] p-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Orders & Licenses</h3>
                <p className="text-xs text-text-muted mt-0.5">{stats?.orders?.total || 0} order records, {stats?.licenses?.total || 0} license keys</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/admin/transactions')}
                  className="rounded-lg border border-accent/25 bg-accent-dim/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-black transition-all"
                >
                  Transactions
                </button>
                <button
                  onClick={() => navigate('/admin/licenses')}
                  className="rounded-lg border border-accent/25 bg-accent-dim/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-black transition-all"
                >
                  Licenses
                </button>
              </div>
            </div>

            {/* Revenue Row */}
            <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-white/[0.01] p-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Revenue Ledger</h3>
                <p className="text-xs text-text-muted mt-0.5">Total Gross Volume: ₹{stats?.revenue?.total || 0}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/admin/revenue')}
                  className="rounded-lg border border-success/25 bg-success-dim/15 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success hover:text-black transition-all"
                >
                  Revenue Report
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 rounded-xl border border-red-500/25 bg-red-950/20 p-5">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider font-display">System Danger Zone</h3>
              <p className="mt-1 text-xs text-text-secondary">Administrative bypass operations. All deletion calls are non-reversible.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => handleDeleteAllData('orders')}
                  disabled={deleting === 'orders'}
                  className="rounded-xl border border-red-500/40 bg-transparent px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {deleting === 'orders' ? 'Processing...' : 'Clear Order Registry'}
                </button>
                <button
                  onClick={() => handleDeleteAllData('licenses')}
                  disabled={deleting === 'licenses'}
                  className="rounded-xl border border-red-500/40 bg-transparent px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {deleting === 'licenses' ? 'Processing...' : 'Clear Licenses Registry'}
                </button>
                <button
                  onClick={() => handleDeleteAllData('activations')}
                  disabled={deleting === 'activations'}
                  className="rounded-xl border border-red-500/40 bg-transparent px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {deleting === 'activations' ? 'Processing...' : 'Clear Active Nodes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="glass-card overflow-hidden border border-border-subtle shadow-card card-accent-top">
        <div className="border-b border-border-subtle bg-bg-surface/40 px-6 py-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">System Information</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="glass-card border border-border-subtle p-4 bg-white/[0.01]">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-display">Database</h3>
              <p className="mt-2 text-sm font-semibold text-text-primary">Supabase PostgreSQL</p>
              <p className="text-[10px] text-text-muted mt-1 font-mono max-w-full truncate">gdsemspksiritbymymjo.supabase.co</p>
            </div>
            <div className="glass-card border border-border-subtle p-4 bg-white/[0.01]">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-display">Storage Node</h3>
              <p className="mt-2 text-sm font-semibold text-text-primary">Supabase Storage</p>
              <p className="text-[10px] text-text-muted mt-1 font-mono">plugins bucket active</p>
            </div>
            <div className="glass-card border border-border-subtle p-4 bg-white/[0.01]">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-display">Auth Provider</h3>
              <p className="mt-2 text-sm font-semibold text-text-primary">Supabase Auth</p>
              <p className="text-[10px] text-text-muted mt-1 font-mono">JWT key tokens</p>
            </div>
            <div className="glass-card border border-border-subtle p-4 bg-white/[0.01]">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-display">Platform Version</h3>
              <p className="mt-2 text-sm font-semibold text-text-primary">v1.0.0 (Production)</p>
              <p className="text-[10px] text-text-muted mt-1 font-mono">PluginVault Core Engine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}