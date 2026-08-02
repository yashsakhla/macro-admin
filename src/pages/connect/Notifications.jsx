import { useState } from 'react';
import { Send, Bell, Megaphone, AlertTriangle } from 'lucide-react';
import { listNotifications, broadcastNotification, sendNotification } from '../../api/macropageConnect/notifications';
import { useApiQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';
import CustomerPicker from './components/CustomerPicker';
import TagPicker from './components/TagPicker';
import './connect.css';

const BROADCAST_CHANNELS = ['in_app', 'whatsapp'];
const TARGETED_CHANNELS = ['in_app', 'whatsapp'];

export default function ConnectNotifications() {
  const { data: history, loading, error, refetch } = useApiQuery(() => listNotifications(), []);

  const [broadcastForm, setBroadcastForm] = useState({ title: '', body: '', channel: 'in_app' });
  const [broadcastError, setBroadcastError] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const broadcastMutation = useApiMutation(broadcastNotification);

  const [targetForm, setTargetForm] = useState({ title: '', body: '', channel: 'in_app', targetType: 'tag', targetIds: [] });
  const [targetError, setTargetError] = useState('');
  const [targetSent, setTargetSent] = useState(false);
  const targetMutation = useApiMutation(sendNotification);

  async function handleBroadcast(e) {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) {
      setBroadcastError('Title and body are required.');
      return;
    }
    const confirmMessage =
      broadcastForm.channel === 'in_app'
        ? 'This sends an in-app notification to every enrolled customer right now, writing directly into their live notification feed. Continue?'
        : 'This sends a WhatsApp broadcast to every enrolled customer right now. Continue?';
    if (!window.confirm(confirmMessage)) return;
    setBroadcastError('');
    try {
      await broadcastMutation.mutate({
        title: broadcastForm.title.trim(),
        body: broadcastForm.body.trim(),
        channel: broadcastForm.channel,
      });
      setBroadcastForm({ title: '', body: '', channel: 'in_app' });
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 3000);
      refetch();
    } catch (err) {
      setBroadcastError(err?.message || 'Could not send broadcast.');
    }
  }

  async function handleTargetedSend(e) {
    e.preventDefault();
    if (!targetForm.title.trim() || !targetForm.body.trim() || targetForm.targetIds.length === 0) {
      setTargetError('Title, body and at least one target are required.');
      return;
    }
    setTargetError('');
    try {
      await targetMutation.mutate({
        title: targetForm.title.trim(),
        body: targetForm.body.trim(),
        channel: targetForm.channel,
        targetType: targetForm.targetType,
        targetIds: targetForm.targetIds,
      });
      setTargetForm({ title: '', body: '', channel: 'in_app', targetType: 'tag', targetIds: [] });
      setTargetSent(true);
      setTimeout(() => setTargetSent(false), 3000);
      refetch();
    } catch (err) {
      setTargetError(err?.message || 'Could not send notification.');
    }
  }

  return (
    <div>
      <div className="section-row" style={{ marginBottom: 22 }}>
        <div className="card">
          <span className="card-title">Broadcast to all customers</span>
          <span className="card-subtitle">Sends immediately to every enrolled customer</span>
          <div className="connect-live-banner">
            <AlertTriangle size={14} />
            This is a real send, not a test — "in_app" writes directly into the live notifications customers see in the product.
          </div>
          <form onSubmit={handleBroadcast}>
            <div className="form-field">
              <label>Title</label>
              <input
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="New product update"
              />
            </div>
            <div className="form-field">
              <label>Body</label>
              <textarea
                value={broadcastForm.body}
                onChange={(e) => setBroadcastForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Write the notification text here."
              />
            </div>
            <div className="form-field">
              <label>Channel</label>
              <select value={broadcastForm.channel} onChange={(e) => setBroadcastForm((f) => ({ ...f, channel: e.target.value }))}>
                {BROADCAST_CHANNELS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {broadcastError && <div className="connect-inline-error">{broadcastError}</div>}
            <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
              <button className="btn-primary" type="submit" disabled={broadcastMutation.loading}>
                <Megaphone size={16} /> {broadcastMutation.loading ? 'Sending…' : 'Broadcast'}
              </button>
              {broadcastSent && <span className="badge green">Broadcast sent</span>}
            </div>
          </form>
        </div>

        <div className="card">
          <span className="card-title">Send to tag(s) or customer(s)</span>
          <span className="card-subtitle">Target a specific segment</span>
          <form onSubmit={handleTargetedSend}>
            <div className="form-field">
              <label>Title</label>
              <input
                value={targetForm.title}
                onChange={(e) => setTargetForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label>Body</label>
              <textarea
                value={targetForm.body}
                onChange={(e) => setTargetForm((f) => ({ ...f, body: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label>Channel</label>
              <select value={targetForm.channel} onChange={(e) => setTargetForm((f) => ({ ...f, channel: e.target.value }))}>
                {TARGETED_CHANNELS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Target type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['tag', 'customer'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="btn-secondary"
                    style={
                      targetForm.targetType === type
                        ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                        : undefined
                    }
                    onClick={() => setTargetForm((f) => ({ ...f, targetType: type, targetIds: [] }))}
                  >
                    {type === 'tag' ? 'Tags' : 'Customers'}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label>{targetForm.targetType === 'tag' ? 'Select tags' : 'Select customers'}</label>
              {targetForm.targetType === 'tag' ? (
                <TagPicker value={targetForm.targetIds} onChange={(ids) => setTargetForm((f) => ({ ...f, targetIds: ids }))} />
              ) : (
                <CustomerPicker
                  multiSelect
                  value={targetForm.targetIds}
                  onChange={(ids) => setTargetForm((f) => ({ ...f, targetIds: ids }))}
                />
              )}
            </div>
            {targetError && <div className="connect-inline-error">{targetError}</div>}
            <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
              <button className="btn-primary" type="submit" disabled={targetMutation.loading}>
                <Send size={16} /> {targetMutation.loading ? 'Sending…' : 'Send'}
              </button>
              {targetSent && <span className="badge green">Notification sent</span>}
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <span className="card-title">Send history</span>
        <span className="card-subtitle">Recent broadcasts and targeted sends</span>
        <AsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && (history?.length ?? 0) === 0}
          emptyIcon={Bell}
          emptyTitle="No notifications sent yet"
          onRetry={refetch}
        >
          <div className="data-table-wrap" style={{ marginTop: 12 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Channel</th>
                  <th>Target</th>
                  <th>Sent</th>
                </tr>
              </thead>
              <tbody>
                {(history || []).map((n) => (
                  <tr key={n.id}>
                    <td>
                      <div className="cell-primary">{n.title}</div>
                      <div className="cell-sub">{n.body}</div>
                    </td>
                    <td>{n.channel}</td>
                    <td>{n.targetType || 'all'}</td>
                    <td>{n.createdAt || n.sentAt || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AsyncState>
      </div>
    </div>
  );
}
