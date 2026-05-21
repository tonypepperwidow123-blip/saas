import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminService } from '../../services/admin.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { formatDate } from '../../utils/formatters';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const response = await adminService.getUsers({ search, role: roleFilter, limit: 50 });
      if (response.success) {
        setUsers(response.data.items);
      }
    } catch (error) {
      console.warn('Failed to fetch users:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    setActionLoading(id);
    try {
      await adminService.suspendUser(id);
      toast.success('User suspended');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to suspend user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReinstate = async (id) => {
    setActionLoading(id);
    try {
      await adminService.activateUser(id);
      toast.success('User reinstated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to reinstate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to DELETE this user? This cannot be undone.')) return;
    setActionLoading(id);
    try {
      await adminService.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePasswordReset = async (user) => {
    const newPassword = prompt(`Enter new password for ${user.name}:`);
    if (!newPassword) return;

    setActionLoading(user.id);
    try {
      await adminService.updateUserPassword(user.id, newPassword);
      toast.success(`Password reset for ${user.name}`);
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage all platform users</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          + Add User
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary placeholder-text-muted focus:border-accent focus:outline-none"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="developer">Developer</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="No users match your search criteria" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Name</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Email</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Role</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Plan</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Joined</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{user.name}</div>
                      {user.business_name && (
                        <div className="text-xs text-text-muted">{user.business_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                        user.role === 'developer' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'developer' ? (
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.subscription_plan === 'business' ? 'bg-yellow-500/20 text-yellow-400' :
                          user.subscription_plan === 'pro' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.subscription_plan || 'free'}
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.is_active ? 'active' : 'suspended'} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePasswordReset(user)}
                          disabled={actionLoading === user.id}
                          className="rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-600 disabled:opacity-50"
                        >
                          Reset Password
                        </button>
                        {user.is_active ? (
                          <button
                            onClick={() => handleSuspend(user.id)}
                            disabled={actionLoading === user.id || user.role === 'admin'}
                            className="rounded-lg bg-warning px-3 py-1.5 text-xs font-medium text-white hover:bg-warning/80 disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReinstate(user.id)}
                            disabled={actionLoading === user.id}
                            className="rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:bg-success/80 disabled:opacity-50"
                          >
                            Reinstate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={actionLoading === user.id || user.role === 'admin'}
                          className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white hover:bg-danger/80 disabled:opacity-50"
                        >
                          Delete
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

      {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onSuccess={fetchUsers} />}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSuccess={fetchUsers} />}
    </div>
  );
}

function AddUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer', business_name: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const password = formData.password || '';
    const hasMinLength = password.length >= 8;
    const isOnlyNumbers = /^[0-9]+$/.test(password);

    if (!hasMinLength || !isOnlyNumbers) {
      toast.error('Password must be at least 8 digits long, and contain only numbers (0-9)');
      return;
    }

    setLoading(true);
    try {
      await adminService.createUser(formData);
      toast.success('User created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-text-primary">Add New User</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-text-secondary">Password</label>
              <span className="text-[10px] text-text-muted">8+ digits, numbers only (0-9)</span>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 pr-10 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="customer">Customer</option>
              <option value="developer">Developer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Business Name (optional)</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-elevated"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    role: user.role || 'customer',
    business_name: user.business_name || '',
    subscription_plan: user.subscription_plan || 'free',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword) {
      const password = formData.newPassword;
      const hasMinLength = password.length >= 8;
      const isOnlyNumbers = /^[0-9]+$/.test(password);

      if (!hasMinLength || !isOnlyNumbers) {
        toast.error('New password must be at least 8 digits long, and contain only numbers (0-9)');
        return;
      }
    }

    setLoading(true);
    try {
      await adminService.updateUser(user.id, {
        name: formData.name,
        role: user.role === 'admin' ? 'admin' : formData.role,
        business_name: formData.business_name,
        subscription_plan: formData.subscription_plan
      });

      if (formData.newPassword) {
        await adminService.updateUserPassword(user.id, formData.newPassword);
      }

      toast.success('User updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-text-primary">Edit User</h2>
        <p className="text-sm text-text-muted mt-1">{user.email}</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={user.role === 'admin'}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="customer">Customer</option>
              <option value="developer">Developer</option>
              {user.role === 'admin' && <option value="admin">Admin</option>}
            </select>
            {user.role === 'admin' && (
              <p className="mt-1 text-xs text-text-muted">Admin role cannot be changed</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Business Name</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          {(user.role === 'developer' || formData.role === 'developer') && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
              <label className="block text-sm font-semibold text-yellow-400 mb-1">⚡ Subscription Plan <span className="text-xs font-normal text-text-muted">(Admin Override)</span></label>
              <select
                value={formData.subscription_plan}
                onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="free">Free — 5 plugins</option>
                <option value="pro">Pro — 10 plugins (₹1,000)</option>
                <option value="business">Business — 20 plugins (₹1,500/mo)</option>
              </select>
              <p className="mt-1 text-xs text-text-muted">Manually override without requiring payment.</p>
            </div>
          )}
          <div className="border-t border-border-subtle pt-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-text-secondary">New Password</label>
              <span className="text-[10px] text-text-muted">8+ digits, numbers only (0-9)</span>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 pr-10 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Enter new password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="mt-1 text-xs text-text-muted">Leave blank to keep current password</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-elevated"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}