import { useState, useEffect } from 'react';
import { developerService } from '../../services/developer.service';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function DeveloperLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const response = await developerService.getLicenses({ limit: 50 });
      if (response.success) {
        setLicenses(response.data.items);
      }
    } catch (error) {
      console.warn('Failed to fetch licenses:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <PageHeader 
        title="Licenses" 
        description="View and verify active customer license keys for your software products" 
      />

      <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-card card-accent-top">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        ) : licenses.length === 0 ? (
          <EmptyState 
            title="No licenses yet" 
            description="Purchased plugin licenses will display here automatically." 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>License Key</th>
                  <th>Plugin</th>
                  <th>Customer</th>
                  <th>Activated Sites</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map(lic => (
                  <tr key={lic.id}>
                    <td>
                      <code className="text-xs font-mono font-semibold text-accent bg-accent-dim/20 px-2.5 py-1 rounded border border-border-accent/30 shadow-inner-glow">
                        {lic.license_key}
                      </code>
                    </td>
                    <td className="font-semibold text-text-primary">
                      {lic.plugin?.name || 'N/A'}
                    </td>
                    <td className="text-text-secondary">
                      {lic.customer?.name || 'N/A'}
                    </td>
                    <td>
                      {lic.activations?.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {lic.activations.map((a, i) => (
                            a.site_url ? (
                              <a 
                                key={i} 
                                href={a.site_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs font-mono text-text-secondary hover:text-accent truncate hover:underline max-w-[160px]"
                              >
                                {a.site_url.replace(/^https?:\/\//, '')}
                              </a>
                            ) : null
                          ))}
                        </div>
                      ) : (
                        <span className="text-text-muted italic text-xs">No sites activated</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={lic.status} size="sm" />
                    </td>
                    <td>{formatDate(lic.created_at)}</td>
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