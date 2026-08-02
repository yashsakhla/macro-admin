import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LifeBuoy, ArrowRight } from 'lucide-react';
import { getProductData } from '../data/mockData';
import { StatusBadge } from './Dashboard';

const FILTERS = ['All', 'Open', 'In Progress', 'Waiting on Customer', 'Resolved', 'Closed'];

export default function SupportQuery() {
  const { product } = useOutletContext();
  const { tickets } = getProductData(product.id);
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return tickets;
    return tickets.filter((t) => t.status === filter);
  }, [filter, tickets]);

  return (
    <div>
      <div className="page-toolbar">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              className="btn-secondary"
              style={
                filter === f
                  ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                  : undefined
              }
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="table-toolbar-count">{filtered.length} tickets</span>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Customer</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Last updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td>
                  <div className="cell-primary">{t.subject}</div>
                  <div className="cell-sub">{t.id}</div>
                </td>
                <td>{t.customer}</td>
                <td>
                  <span
                    className={`badge ${
                      t.priority === 'Urgent'
                        ? 'red'
                        : t.priority === 'High'
                        ? 'amber'
                        : 'gray'
                    }`}
                  >
                    {t.priority}
                  </span>
                </td>
                <td><StatusBadge status={t.status} /></td>
                <td>{t.updated}</td>
                <td>
                  <button
                    className="btn-secondary"
                    onClick={() => navigate(`/p/${product.id}/support-query/${t.id}`)}
                  >
                    Details <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">
            <LifeBuoy size={22} style={{ marginBottom: 10, opacity: 0.5 }} />
            <h4>No tickets in this view</h4>
            <p>Nothing matches this filter right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
