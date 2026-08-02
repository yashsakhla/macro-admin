import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, ArrowRight, Plus, X } from 'lucide-react';
import { listTickets, createTicket } from '../../api/macropageConnect/support';
import { usePaginatedQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';
import Pagination from './components/Pagination';
import CustomerPicker from './components/CustomerPicker';
import TicketStatusBadge from './components/TicketStatusBadge';

const STATUS_FILTERS = ['All', 'open', 'pending', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { high: 'red', medium: 'amber', low: 'gray' };

const EMPTY_FORM = { customerId: '', subject: '', description: '', priority: 'medium', assignedTo: '' };

export default function ConnectSupportQuery() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const limit = 20;

  useEffect(() => {
    setPage(1);
  }, [status]);

  const { items, total, totalPages, loading, error, refetch } = usePaginatedQuery(listTickets, {
    page,
    limit,
    status: status === 'All' ? undefined : status,
  });

  const createMutation = useApiMutation(createTicket);

  function openModal() {
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.customerId || !form.subject.trim()) {
      setFormError('Customer and subject are required.');
      return;
    }
    try {
      await createMutation.mutate({
        customerId: form.customerId,
        subject: form.subject.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        assignedTo: form.assignedTo.trim() || undefined,
      });
      setShowModal(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Could not create ticket.');
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
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="table-toolbar-count">{total} tickets</span>
          <button className="btn-primary" onClick={openModal}>
            <Plus size={15} /> New ticket
          </button>
        </div>
      </div>

      <div className="data-table-wrap">
        <AsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && items.length === 0}
          emptyIcon={LifeBuoy}
          emptyTitle="No tickets in this view"
          emptyMessage="Nothing matches this filter right now."
          onRetry={refetch}
        >
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
              {items.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="cell-primary">{t.subject}</div>
                    <div className="cell-sub">{t.id}</div>
                  </td>
                  <td>{t.customer?.name || t.customerName || t.customerId}</td>
                  <td>
                    <span className={`badge ${PRIORITY_COLORS[t.priority] || 'gray'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td><TicketStatusBadge status={t.status} /></td>
                  <td>{t.updatedAt || t.updated || '—'}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => navigate(`/p/macropage-connect/support-query/${t.id}`)}
                    >
                      Details <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AsyncState>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>New support ticket</h3>
              <button className="btn-secondary" style={{ padding: 6 }} onClick={() => setShowModal(false)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-field">
                <label>Customer</label>
                <CustomerPicker value={form.customerId} onChange={(id) => setForm((f) => ({ ...f, customerId: id }))} />
              </div>
              <div className="form-field">
                <label>Subject</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Unable to reconcile last invoice"
                  required
                />
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional details for the support team"
                />
              </div>
              <div className="form-field">
                <label>Priority</label>
                <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Assigned to (optional)</label>
                <input
                  value={form.assignedTo}
                  onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                  placeholder="Agent ID"
                />
              </div>
              {formError && <div className="connect-inline-error">{formError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.loading}>
                  {createMutation.loading ? 'Creating…' : 'Create ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
