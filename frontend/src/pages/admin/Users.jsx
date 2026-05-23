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
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-display">User Accounts</h1>
          <p className="text-xs text-text-secondary mt-0.5">Audit, authenticate, and manage overall platform customer bases</p>
        </div>
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-amber px-4.5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-glow-sm hover:shadow-glow transition-all"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 bg-bg-surface/30 p-4 rounded-2xl border border-border-subtle">
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Filter by name, email, business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field py-2 text-sm"
          />
        </div>
        <div className="relative min-w-[160px]">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field py-2 text-sm cursor-pointer appearance-none bg-bg-elevated pr-10"
          >
            <option value="">All Roles</option>
            <option value="admin">Platform Admin</option>
            <option value="developer">Developer</option>
            <option value="customer">Customer</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pt-0.5 text-text-muted">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-card card-accent-top">
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : users.length === 0 ? (
          <EmptyState 
            title="No users found" 
            description="Adjust your search criteria or register a new user on the platform." 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Identity / Profile</th>
                  <th>Email Address</th>
                  <th>Account Role</th>
                  <th>Usage Plan</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <p className="font-semibold text-text-primary">{user.name}</p>
                        {user.business_name && (
                          <p className="text-xs text-text-muted mt-0.5 font-mono">{user.business_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="font-mono text-xs text-text-secondary">{user.email}</td>
                    <td>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        user.role === 'admin' 
                          ? 'bg-accent2-dim text-accent2 border-accent2/25' 
                          : user.role === 'developer' 
                          ? 'bg-accent-dim text-accent border-border-accent/35' 
                          : 'bg-bg-elevated border border-border-strong text-text-secondary'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.role === 'developer' ? (
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider font-mono ${
                          user.subscription_plan === 'business' 
                            ? 'bg-accent-dim text-accent border-border-accent/40' 
                            : user.subscription_plan === 'pro' 
                            ? 'bg-success/10 text-success border-success/20' 
                            : 'bg-bg-elevated border border-border-strong text-text-muted'
                        }`}>
                          {user.subscription_plan || 'free'}
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs font-mono">—</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={user.is_active ? 'active' : 'suspended'} size="sm" />
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="btn-ghost px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePasswordReset(user)}
                          disabled={actionLoading === user.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-accent2/25 bg-accent2-dim/20 px-2.5 py-1.5 text-xs font-semibold text-accent2 hover:bg-accent2 hover:text-black transition-all disabled:opacity-50"
                        >
                          Reset
                        </button>
                        {user.is_active ? (
                          <button
                            onClick={() => handleSuspend(user.id)}
                            disabled={actionLoading === user.id || user.role === 'admin'}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-warning/25 bg-warning/10 px-2.5 py-1.5 text-xs font-semibold text-warning hover:bg-warning hover:text-black transition-all disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReinstate(user.id)}
                            disabled={actionLoading === user.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-success/25 bg-success/15 px-2.5 py-1.5 text-xs font-semibold text-success hover:bg-success hover:text-black transition-all disabled:opacity-50"
                          >
                            Reinstate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={actionLoading === user.id || user.role === 'admin'}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-danger/25 bg-danger/10 px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger hover:text-black transition-all disabled:opacity-50"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-fast">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-bg-card p-6 shadow-2xl glass-card card-accent-top">
        <h2 className="text-lg font-bold text-text-primary">Add New User</h2>
        <p className="text-xs text-text-secondary mt-0.5">Register a manual credential set for developers or clients</p>
        
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Numeric Password</label>
              <span className="text-[10px] text-text-muted">8+ digits, numbers only (0-9)</span>
            </div>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field pr-10 font-mono"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors text-sm"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Account Role</label>
              <div className="relative mt-1.5">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field cursor-pointer appearance-none bg-bg-elevated pr-10"
                >
                  <option value="customer">Customer</option>
                  <option value="developer">Developer</option>
                  <option value="admin">Administrator</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Business Name (optional)</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="input-field mt-1.5"
            />
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold transition-all text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-grow btn-amber rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-glow-sm hover:shadow-glow inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating…
                </>
              ) : (
                'Create User'
              )}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-fast">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-bg-card p-6 shadow-2xl glass-card card-accent-top">
        <h2 className="text-lg font-bold text-text-primary">Edit User Profile</h2>
        <p className="text-xs font-mono text-text-secondary mt-0.5">{user.email}</p>
        
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Account Role</label>
            <div className="relative mt-1.5">
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={user.role === 'admin'}
                className="input-field cursor-pointer appearance-none bg-bg-elevated pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="customer">Customer</option>
                <option value="developer">Developer</option>
                {user.role === 'admin' && <option value="admin">Administrator</option>}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {user.role === 'admin' && (
              <p className="mt-1 text-[11px] text-text-muted">Security rule: Administrator roles cannot be downgraded</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Business Name</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="input-field mt-1.5"
            />
          </div>
          {(user.role === 'developer' || formData.role === 'developer') && (
            <div className="rounded-2xl border border-border-accent bg-accent-dim/10 p-4 shadow-inner-glow">
              <label className="block text-xs font-bold text-accent uppercase tracking-wider mb-1.5">⚡ Subscription Override</label>
              <div className="relative mt-1">
                <select
                  value={formData.subscription_plan}
                  onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                  className="input-field cursor-pointer appearance-none bg-bg-elevated pr-10 text-xs"
                >
                  <option value="free">Free Tiers (max 5 uploads)</option>
                  <option value="pro">Pro Tiers (max 10 uploads)</option>
                  <option value="business">Business Tiers (max 20 uploads)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          <div className="border-t border-border-subtle pt-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Override Password</label>
              <span className="text-[10px] text-text-muted">8+ digits, numbers only (0-9)</span>
            </div>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="input-field pr-10 font-mono"
                placeholder="Enter override password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-sm"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">Leave blank to retain existing account password</p>
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold transition-all text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-grow btn-amber rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-glow-sm hover:shadow-glow inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}