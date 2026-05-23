import { useState, useEffect } from 'react';
import { developerService } from '../../services/developer.service';
import PageHeader from '../../components/shared/PageHeader';
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
    <div className="space-y-6 page-enter">
      <PageHeader 
        title="Customers" 
        description="View details of developers and builders who license your WordPress extensions" 
      />

      <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-card card-accent-top">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <EmptyState 
            title="No customers yet" 
            description="Your customer base will populate automatically as users license your plugins." 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email Address</th>
                  <th>Acquisition Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(cust => (
                  <tr key={cust.id}>
                    <td className="font-semibold text-text-primary">
                      {cust.name || 'Anonymous User'}
                    </td>
                    <td className="font-mono text-xs text-text-secondary">
                      {cust.email || 'N/A'}
                    </td>
                    <td>{formatDate(cust.created_at)}</td>
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