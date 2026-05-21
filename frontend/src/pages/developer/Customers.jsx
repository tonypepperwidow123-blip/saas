import { useState, useEffect } from 'react';
import { developerService } from '../../services/developer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function DeveloperCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await developerService.getCustomers();
      if (response.success) {
        setCustomers(response.data || []);
      }
    } catch (error) {
      console.warn('Failed to fetch customers:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="View customers who purchased your plugins" />

      <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 animate-pulse rounded bg-bg-elevated" />)}</div>
        ) : customers.length === 0 ? (
          <EmptyState title="No customers yet" description="Customers will appear here after purchasing your plugins" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Customer</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Email</th>
                  <th className="px-6 py-3 text-sm font-medium text-text-secondary">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {customers.map(cust => (
                  <tr key={cust.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4 font-medium text-text-primary">{cust.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{cust.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(cust.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}