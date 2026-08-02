import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Save, MessageCircle } from 'lucide-react';
import { getTicket, updateTicket, deleteTicket } from '../../api/macropageConnect/support';
import { useApiQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';
import TicketStatusBadge from './components/TicketStatusBadge';

const STATUSES = ['open', 'pending', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high'];

export default function ConnectQueryDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { data: ticket, loading, error, refetch } = useApiQuery(() => getTicket(ticketId), [ticketId]);
  const updateMutation = useApiMutation((payload) => updateTicket(ticketId, payload));
  const deleteMutation = useApiMutation(() => deleteTicket(ticketId));
  const [draft, setDraft] = useState(null);
  const [saveError, setSaveError] = useState('');

  const current = draft || ticket || {};

  function startEditing(field, value) {
    setDraft({ ...current, [field]: value });
  }

  async function handleSave() {
    if (!draft) return;
    setSaveError('');
    try {
      await updateMutation.mutate({ status: draft.status, priority: draft.priority, assignedTo: draft.assignedTo });
      setDraft(null);
      refetch();
    } catch (err) {
      setSaveError(err?.message || 'Could not update ticket.');
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this ticket? This cannot be undone.')) return;
    await deleteMutation.mutate();
    navigate('/p/macropage-connect/support-query');
  }

  return (
    <div>
      <div className="page-toolbar" style={{ justifyContent: 'space-between' }}>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back to queries
        </button>
        {ticket && (
          <button className="btn-secondary" style={{ color: 'var(--danger)' }} onClick={handleDelete} disabled={deleteMutation.loading}>
            <Trash2 size={14} /> Delete ticket
          </button>
        )}
      </div>

      <AsyncState loading={loading} error={error} onRetry={refetch}>
        {ticket && (
          <>
            <div className="card" style={{ marginBottom: 22 }}>
              <div className="card-title">{ticket.subject}</div>
              <div className="card-subtitle">
                Ticket ID {ticket.id} · Customer {ticket.customer?.name || ticket.customerName || ticket.customerId}
              </div>
              {ticket.description && (
                <p style={{ marginTop: 12, color: 'var(--ink-700)' }}>{ticket.description}</p>
              )}
            </div>

            <div className="section-row" style={{ marginBottom: 22 }}>
              <div className="card">
                <span className="card-title">Status &amp; priority</span>
                <div className="form-field">
                  <label>Status</label>
                  <select value={current.status} onChange={(e) => startEditing('status', e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Priority</label>
                  <select value={current.priority} onChange={(e) => startEditing('priority', e.target.value)}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Assigned to</label>
                  <input
                    value={current.assignedTo || ''}
                    onChange={(e) => startEditing('assignedTo', e.target.value)}
                    placeholder="Agent ID"
                  />
                </div>
                {saveError && <div className="connect-inline-error">{saveError}</div>}
                <button className="btn-primary" onClick={handleSave} disabled={!draft || updateMutation.loading}>
                  <Save size={15} /> {updateMutation.loading ? 'Saving…' : 'Save changes'}
                </button>
              </div>

              <div className="card">
                <span className="card-title">Summary</span>
                <div className="detail-row" style={{ gap: 14 }}>
                  <div>
                    <div className="cell-primary">Current status</div>
                    <div className="cell-sub"><TicketStatusBadge status={ticket.status} /></div>
                  </div>
                  <div>
                    <div className="cell-primary">Last updated</div>
                    <div className="cell-sub">{ticket.updatedAt || ticket.updated || '—'}</div>
                  </div>
                </div>
                <div style={{ marginTop: 18 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => navigate(`/p/macropage-connect/live-chat?ticketId=${ticket.id}`)}
                  >
                    <MessageCircle size={14} /> Open live chat for this ticket
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </AsyncState>
    </div>
  );
}
