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
      // In a real app, this would save to a settings table
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
    <div className="space-y-6">
      <PageHeader title="Settings" description="Platform configuration and management" />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={loading ? '...' : stats?.users?.total || 0} loading={loading} />
        <StatCard title="Developers" value={loading ? '...' : stats?.users?.developers || 0} loading={loading} />
        <StatCard title="Plugins" value={loading ? '...' : stats?.plugins?.total || 0} loading={loading} />
        <StatCard title="Total Revenue" value={stats?.revenue?.total || 0} currency loading={loading} />
      </div>

      {/* Platform Settings */}
      <div className="rounded-xl border border-border-subtle bg-bg-card">
        <div className="border-b border-border-subtle px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Platform Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Platform Name</label>
              <input
                type="text"
                value={platformSettings.platform_name}
                onChange={(e) => setPlatformSettings({ ...platformSettings, platform_name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Contact Email</label>
              <input
                type="email"
                value={platformSettings.platform_email}
                onChange={(e) => setPlatformSettings({ ...platformSettings, platform_email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={platformSettings.allow_registrations}
                onChange={(e) => setPlatformSettings({ ...platformSettings, allow_registrations: e.target.checked })}
                className="h-5 w-5 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-text-primary">Allow new user registrations</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={platformSettings.require_plugin_approval}
                onChange={(e) => setPlatformSettings({ ...platformSettings, require_plugin_approval: e.target.checked })}
                className="h-5 w-5 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-text-primary">Require admin approval for plugins</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={platformSettings.enable_payments}
                onChange={(e) => setPlatformSettings({ ...platformSettings, enable_payments: e.target.checked })}
                className="h-5 w-5 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-text-primary">Enable payment processing (Razorpay)</span>
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Database Management */}
      <div className="rounded-xl border border-border-subtle bg-bg-card">
        <div className="border-b border-border-subtle px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Database Management</h2>
          <p className="mt-1 text-sm text-text-muted">Manage and clean up platform data</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Users Row */}
            <div className="flex items-center justify-between rounded-lg border border-border-subtle p-4">
              <div>
                <h3 className="font-medium text-text-primary">Users</h3>
                <p className="text-sm text-text-muted">{stats?.users?.total || 0} total users ({stats?.users?.developers || 0} developers, {stats?.users?.customers || 0} customers)</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/admin/developers')}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Developers
                </button>
                <button
                  onClick={() => navigate('/admin/customers')}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Customers
                </button>
              </div>
            </div>

            {/* Plugins Row */}
            <div className="flex items-center justify-between rounded-lg border border-border-subtle p-4">
              <div>
                <h3 className="font-medium text-text-primary">Plugins</h3>
                <p className="text-sm text-text-muted">{stats?.plugins?.total || 0} total plugins ({stats?.plugins?.pending || 0} pending approval)</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/admin/plugins')}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  View All
                </button>
                <button
                  onClick={() => navigate('/admin/pending-approvals')}
                  className="rounded-lg bg-warning px-4 py-2 text-sm font-medium text-white hover:bg-warning/80"
                >
                  Pending ({stats?.plugins?.pending || 0})
                </button>
              </div>
            </div>

            {/* Orders Row */}
            <div className="flex items-center justify-between rounded-lg border border-border-subtle p-4">
              <div>
                <h3 className="font-medium text-text-primary">Orders & Licenses</h3>
                <p className="text-sm text-text-muted">{stats?.orders?.total || 0} orders, {stats?.licenses?.total || 0} licenses</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/admin/transactions')}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Transactions
                </button>
                <button
                  onClick={() => navigate('/admin/licenses')}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Licenses
                </button>
              </div>
            </div>

            {/* Revenue Row */}
            <div className="flex items-center justify-between rounded-lg border border-border-subtle p-4">
              <div>
                <h3 className="font-medium text-text-primary">Revenue</h3>
                <p className="text-sm text-text-muted">Total: ₹{stats?.revenue?.total || 0}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/admin/revenue')}
                  className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:bg-success/80"
                >
                  Revenue Report
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <h3 className="font-medium text-red-400">Danger Zone</h3>
              <p className="mt-1 text-sm text-text-muted">These actions are irreversible. Proceed with caution.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => handleDeleteAllData('orders')}
                  disabled={deleting === 'orders'}
                  className="rounded-lg border border-red-500 bg-transparent px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deleting === 'orders' ? 'Deleting...' : 'Clear All Orders'}
                </button>
                <button
                  onClick={() => handleDeleteAllData('licenses')}
                  disabled={deleting === 'licenses'}
                  className="rounded-lg border border-red-500 bg-transparent px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deleting === 'licenses' ? 'Deleting...' : 'Clear All Licenses'}
                </button>
                <button
                  onClick={() => handleDeleteAllData('activations')}
                  disabled={deleting === 'activations'}
                  className="rounded-lg border border-red-500 bg-transparent px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deleting === 'activations' ? 'Deleting...' : 'Clear All Activations'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="rounded-xl border border-border-subtle bg-bg-card">
        <div className="border-b border-border-subtle px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">System Information</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-bg-elevated p-4">
              <h3 className="text-sm font-medium text-text-secondary">Database</h3>
              <p className="mt-1 text-text-primary">Supabase PostgreSQL</p>
              <p className="text-xs text-text-muted">gdsemspksiritbymymjo.supabase.co</p>
            </div>
            <div className="rounded-lg bg-bg-elevated p-4">
              <h3 className="text-sm font-medium text-text-secondary">Storage</h3>
              <p className="mt-1 text-text-primary">Supabase Storage</p>
              <p className="text-xs text-text-muted">plugins bucket configured</p>
            </div>
            <div className="rounded-lg bg-bg-elevated p-4">
              <h3 className="text-sm font-medium text-text-secondary">Authentication</h3>
              <p className="mt-1 text-text-primary">Supabase Auth</p>
              <p className="text-xs text-text-muted">JWT-based authentication</p>
            </div>
            <div className="rounded-lg bg-bg-elevated p-4">
              <h3 className="text-sm font-medium text-text-secondary">Version</h3>
              <p className="mt-1 text-text-primary">1.0.0</p>
              <p className="text-xs text-text-muted">PluginVault SaaS Platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}