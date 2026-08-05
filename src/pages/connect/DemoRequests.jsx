import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { listDemoRequests, updateDemoRequestStatus } from '../../api/macropageConnect/demoRequests';
import { usePaginatedQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';
import Pagination from './components/Pagination';
import DemoRequestStatusBadge from './components/DemoRequestStatusBadge';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const STATUS_FILTERS = ['All', 'PENDING', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];
const STATUS_LABELS = {
  All: 'All',
  PENDING: 'Pending',
  CONTACTED: 'Contacted',
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function ConnectDemoRequests() {
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const limit = 20;

  useEffect(() => {
    setPage(1);
  }, [status]);

  const { items, total, totalPages, loading, error, refetch } = usePaginatedQuery(listDemoRequests, {
    page,
    limit,
    status: status === 'All' ? undefined : status,
  });

  const statusMutation = useApiMutation(updateDemoRequestStatus);

  async function handleStatusChange(id, newStatus) {
    setUpdatingId(id);
    try {
      await statusMutation.mutate(id, { status: newStatus });
      refetch();
    } catch {
      // Error surfaces via statusMutation.error below the table.
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="page-toolbar">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              className="btn-secondary"
              style={
                status === f
                  ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                  : undefined
              }
              onClick={() => setStatus(f)}
            >
              {STATUS_LABELS[f]}
            </button>
          ))}
        </div>
        <span className="table-toolbar-count">{total} demo requests</span>
      </div>

      {statusMutation.error && (
        <div className="connect-inline-error" style={{ marginBottom: 12 }}>
          {statusMutation.error.message || 'Could not update status.'}
        </div>
      )}

      <div className="data-table-wrap">
        <AsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && items.length === 0}
          emptyIcon={CalendarClock}
          emptyTitle="No demo requests in this view"
          emptyMessage="Nothing matches this filter right now."
          onRetry={refetch}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Requested</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const id = r._id || r.id;
                return (
                  <tr key={id}>
                    <td>
                      <div className="cell-primary">{r.userName || '—'}</div>
                      <div className="cell-sub">{id}</div>
                    </td>
                    <td>
                      <div>{r.userEmail || '—'}</div>
                      <div className="cell-sub">{r.phone || ''}</div>
                    </td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <DemoRequestStatusBadge status={r.status} />
                        <select
                          className="filter-select"
                          value={r.status || ''}
                          disabled={updatingId === id}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                        >
                          {STATUS_FILTERS.filter((s) => s !== 'All').map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AsyncState>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
