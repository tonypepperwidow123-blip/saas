import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminService } from '../../services/admin.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, [search]);

  const fetchAdmins = async () => {
    try {
      const response = await adminService.getAdmins({ search, limit: 50 });
      if (response.success) {
        setAdmins(response.data.items);
      }
    } catch (error) {
      console.warn('Fetch error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (admin) => {
    const newPassword = prompt(`Enter new password for ${admin.name}:`);
    if (!newPassword || newPassword.length < 1) return;
    setActionLoading(admin.id);
    try {
      await adminService.updateUserPassword(admin.id, newPassword);
      toast.success(`Password reset for ${admin.name}`);
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admins</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage all admin users</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          + Add Admin
        </button>
      </div>

      <input
        type="text"
        placeholder="Search admins..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary placeholder-text-muted focus:border-accent focus:outline-none"
      />

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded bg-bg-elevated" />)}</div>
        ) : admins.length === 0 ? (
          <EmptyState title="No admins" description="No admins found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Admin</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Email</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Joined</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{admin.name}</div>
                      {admin.business_name && <div className="text-xs text-text-muted">{admin.business_name}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{admin.email}</td>
                    <td className="px-6 py-4"><StatusBadge status={admin.is_active ? 'active' : 'suspended'} size="sm" /></td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(admin.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setEditingAdmin(admin)}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover">
                          Edit
                        </button>
                        <button onClick={() => handlePasswordReset(admin)} disabled={actionLoading === admin.id}
                          className="rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-600 disabled:opacity-50">
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingAdmin && <AdminModal admin={editingAdmin} onClose={() => setEditingAdmin(null)} onSuccess={fetchAdmins} />}
      {showAddModal && <AdminModal admin={{ id: 'new', name: '', email: '', password: '', business_name: '' }} isNew={true} onClose={() => setShowAddModal(false)} onSuccess={fetchAdmins} />}
    </div>
  );
}

function AdminModal({ admin, isNew = false, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: admin.name || '',
    email: admin.email || '',
    password: '',
    business_name: admin.business_name || ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isNew) {
        if (!formData.email || !formData.password) {
          toast.error('Email and password are required');
          setLoading(false);
          return;
        }
        await adminService.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'admin',
          business_name: formData.business_name
        });
        toast.success('Admin created');
      } else {
        await adminService.updateUser(admin.id, {
          name: formData.name,
          business_name: formData.business_name
        });
        if (formData.password) {
          await adminService.updateUserPassword(admin.id, formData.password);
        }
        toast.success('Admin updated');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-text-primary">
          {isNew ? 'Add Admin' : 'Edit Admin'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">Name</label>
            <input type="text" required value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none" />
          </div>
          {isNew && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-secondary">Email</label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 pr-10 text-text-primary focus:border-accent focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-text-secondary">Business Name (optional)</label>
            <input type="text" value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none" />
          </div>
          {!isNew && (
            <div className="border-t border-border-subtle pt-4">
              <label className="block text-sm font-medium text-text-secondary">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 pr-10 text-text-primary focus:border-accent focus:outline-none"
                  placeholder="Enter new password to change"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">Leave blank to keep current password</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-elevated">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}