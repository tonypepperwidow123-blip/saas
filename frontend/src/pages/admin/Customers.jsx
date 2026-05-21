import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminService } from '../../services/admin.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [editingCust, setEditingCust] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      const response = await adminService.getCustomers({ search, limit: 50 });
      if (response.success) {
        setCustomers(response.data.items);
      }
    } catch (error) {
      console.warn('Fetch error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    if (!confirm('Suspend this customer?')) return;
    setActionLoading(id);
    try {
      await adminService.suspendUser(id);
      toast.success('Customer suspended');
      fetchCustomers();
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id) => {
    setActionLoading(id);
    try {
      await adminService.activateUser(id);
      toast.success('Customer activated');
      fetchCustomers();
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('DELETE this customer? This cannot be undone!')) return;
    setActionLoading(id);
    try {
      await adminService.deleteUser(id);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePasswordReset = async (cust) => {
    const newPassword = prompt(`Enter new password for ${cust.name}:`);
    if (!newPassword || newPassword.length < 1) return;
    setActionLoading(cust.id);
    try {
      await adminService.updateUserPassword(cust.id, newPassword);
      toast.success(`Password reset for ${cust.name}`);
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
          <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage all customers</p>
        </div>
        <button
          onClick={() => setEditingCust({ id: 'new', name: '', email: '', password: '', business_name: '' })}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          + Add Customer
        </button>
      </div>

      <input
        type="text"
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary placeholder-text-muted focus:border-accent focus:outline-none"
      />

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded bg-bg-elevated" />)}</div>
        ) : customers.length === 0 ? (
          <EmptyState title="No customers" description="No customers found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Customer</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Email</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Joined</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {customers.map(cust => (
                  <tr key={cust.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{cust.name}</div>
                      {cust.business_name && <div className="text-xs text-text-muted">{cust.business_name}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{cust.email}</td>
                    <td className="px-6 py-4"><StatusBadge status={cust.is_active ? 'active' : 'suspended'} size="sm" /></td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(cust.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setEditingCust(cust)}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover">
                          Edit
                        </button>
                        <button onClick={() => handlePasswordReset(cust)} disabled={actionLoading === cust.id}
                          className="rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-600 disabled:opacity-50">
                          Reset Password
                        </button>
                        {cust.is_active ? (
                          <button onClick={() => handleSuspend(cust.id)} disabled={actionLoading === cust.id}
                            className="rounded-lg bg-warning px-3 py-1.5 text-xs font-medium text-white hover:bg-warning/80 disabled:opacity-50">
                            Suspend
                          </button>
                        ) : (
                          <button onClick={() => handleActivate(cust.id)} disabled={actionLoading === cust.id}
                            className="rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:bg-success/80 disabled:opacity-50">
                            Activate
                          </button>
                        )}
                        <button onClick={() => handleDelete(cust.id)} disabled={actionLoading === cust.id}
                          className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white hover:bg-danger/80 disabled:opacity-50">
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

      {editingCust && <CustomerModal customer={editingCust} onClose={() => setEditingCust(null)} onSuccess={fetchCustomers} />}
    </div>
  );
}

function CustomerModal({ customer, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    password: '',
    business_name: customer.business_name || '',
    is_new: customer.id === 'new'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.is_new) {
        if (!formData.email || !formData.password) {
          toast.error('Email and password are required');
          setLoading(false);
          return;
        }
        await adminService.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'customer',
          business_name: formData.business_name
        });
        toast.success('Customer created');
      } else {
        await adminService.updateUser(customer.id, {
          name: formData.name,
          business_name: formData.business_name
        });
        if (formData.password) {
          await adminService.updateUserPassword(customer.id, formData.password);
        }
        toast.success('Customer updated');
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
          {formData.is_new ? 'Add Customer' : 'Edit Customer'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">Name</label>
            <input type="text" required value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2 text-text-primary focus:border-accent focus:outline-none" />
          </div>
          {formData.is_new && (
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
          {!formData.is_new && (
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