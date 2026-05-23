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
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-display">Customers</h1>
          <p className="text-xs text-text-secondary mt-0.5">Manage and audit registered customer/buyer profiles</p>
        </div>
        <div>
          <button
            onClick={() => setEditingCust({ id: 'new', name: '', email: '', password: '', business_name: '' })}
            className="btn-amber px-4.5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-glow-sm hover:shadow-glow transition-all"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 bg-bg-surface/30 p-4 rounded-2xl border border-border-subtle max-w-md">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field py-2 text-sm"
        />
      </div>

      <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-card card-accent-top">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <EmptyState title="No customers found" description="Adjust your search filters or register a new customer account." />
        ) : (
          <div className="overflow-x-auto">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email Address</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(cust => (
                  <tr key={cust.id}>
                    <td>
                      <div>
                        <p className="font-semibold text-text-primary">{cust.name}</p>
                        {cust.business_name && (
                          <p className="text-xs text-text-muted mt-0.5 font-mono">{cust.business_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="font-mono text-xs text-text-secondary">{cust.email}</td>
                    <td>
                      <StatusBadge status={cust.is_active ? 'active' : 'suspended'} size="sm" />
                    </td>
                    <td>{formatDate(cust.created_at)}</td>
                    <td>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <button 
                          onClick={() => setEditingCust(cust)}
                          className="btn-ghost px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handlePasswordReset(cust)} 
                          disabled={actionLoading === cust.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-accent2/25 bg-accent2-dim/20 px-2.5 py-1.5 text-xs font-semibold text-accent2 hover:bg-accent2 hover:text-black transition-all disabled:opacity-50"
                        >
                          Reset
                        </button>
                        {cust.is_active ? (
                          <button 
                            onClick={() => handleSuspend(cust.id)} 
                            disabled={actionLoading === cust.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-warning/25 bg-warning-dim/20 px-2.5 py-1.5 text-xs font-semibold text-warning hover:bg-warning hover:text-black transition-all disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivate(cust.id)} 
                            disabled={actionLoading === cust.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-success/25 bg-success-dim/20 px-2.5 py-1.5 text-xs font-semibold text-success hover:bg-success hover:text-black transition-all disabled:opacity-50"
                          >
                            Activate
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(cust.id)} 
                          disabled={actionLoading === cust.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-danger/25 bg-danger-dim/20 px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger hover:text-black transition-all disabled:opacity-50"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-fast">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-bg-card p-6 shadow-2xl glass-card card-accent-top">
        <h2 className="text-lg font-bold text-text-primary">
          {formData.is_new ? 'Add Customer' : 'Edit Customer'}
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          {formData.is_new ? 'Create a new customer/buyer account' : `Modify credentials and profile details`}
        </p>

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
          {formData.is_new && (
            <>
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Password</label>
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
            </>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Business Name (optional)</label>
            <input 
              type="text" 
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="input-field mt-1.5" 
            />
          </div>
          {!formData.is_new && (
            <div className="border-t border-border-subtle pt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">Override Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pr-10 font-mono"
                  placeholder="Enter new password to change"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-text-muted">Leave blank to retain current customer password</p>
            </div>
          )}
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
                'Save Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}