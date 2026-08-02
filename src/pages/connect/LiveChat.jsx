import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, LifeBuoy } from 'lucide-react';
import { listTickets, getTicket } from '../../api/macropageConnect/support';
import { usePaginatedQuery, useApiQuery } from '../../api/macropageConnect/hooks';
import { connectSupportChat } from '../../api/macropageConnect/socket';
import { getSession } from '../../api/macropageConnect/session';
import AsyncState from './components/AsyncState';
import TicketStatusBadge from './components/TicketStatusBadge';

const STATUS_FILTERS = ['open', 'pending', 'resolved', 'closed', 'all'];

// Real-time support console: ticket list on the left, a Socket.io-backed
// thread (namespace /macropage-connect/support-chat, rooms keyed by
// ticketId) on the right.
export default function ConnectLiveChat() {
  const user = getSession()?.user;
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState('open');
  const [activeTicketId, setActiveTicketId] = useState(searchParams.get('ticketId') || null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [connecting, setConnecting] = useState(false);
  const chatHandleRef = useRef(null);

  const { items, loading, error, refetch } = usePaginatedQuery(listTickets, {
    page: 1,
    limit: 50,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const { data: activeTicket } = useApiQuery(
    () => (activeTicketId ? getTicket(activeTicketId) : Promise.resolve(null)),
    [activeTicketId]
  );

  useEffect(() => {
    if (!activeTicketId) return undefined;
    setMessages([]);
    setConnecting(true);

    const handle = connectSupportChat(activeTicketId, {
      onHistory: (history) => {
        setMessages(Array.isArray(history) ? history : history?.messages || []);
        setConnecting(false);
      },
      onMessage: (msg) => setMessages((prev) => [...prev, msg]),
    });
    chatHandleRef.current = handle;

    return () => {
      handle.disconnect();
      chatHandleRef.current = null;
    };
  }, [activeTicketId]);

  function selectTicket(id) {
    setActiveTicketId(id);
    setSearchParams(id ? { ticketId: id } : {});
  }

  function handleSend(e) {
    e.preventDefault();
    if (!draft.trim() || !activeTicketId || !chatHandleRef.current) return;
    chatHandleRef.current.sendMessage({
      senderType: 'agent',
      senderId: user?.id || user?.email,
      message: draft.trim(),
    });
    setDraft('');
  }

  return (
    <div className="chat-shell">
      <div className="chat-list scrollbar-thin">
        <div style={{ display: 'flex', gap: 6, padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              className="btn-secondary"
              style={
                statusFilter === f
                  ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)', padding: '6px 10px', fontSize: 12 }
                  : { padding: '6px 10px', fontSize: 12 }
              }
              onClick={() => setStatusFilter(f)}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <AsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && items.length === 0}
          emptyIcon={LifeBuoy}
          emptyTitle="No tickets"
          onRetry={refetch}
        >
          {items.map((t) => (
            <div
              key={t.id}
              className={`chat-list-item${t.id === activeTicketId ? ' active' : ''}`}
              onClick={() => selectTicket(t.id)}
            >
              <div className="chat-avatar">{(t.customer?.name || t.customerName || '?')[0]}</div>
              <div className="chat-list-info">
                <div className="chat-name">
                  <span>{t.subject}</span>
                </div>
                <div className="chat-preview">{t.customer?.name || t.customerName || t.customerId}</div>
              </div>
            </div>
          ))}
        </AsyncState>
      </div>

      <div className="chat-window">
        <div className="chat-window-header">
          {activeTicket ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
              <span>{activeTicket.subject}</span>
              <TicketStatusBadge status={activeTicket.status} />
            </div>
          ) : (
            'Select a ticket to start chatting'
          )}
        </div>
        <div className="chat-messages scrollbar-thin">
          {connecting && <div className="cell-sub">Connecting…</div>}
          {messages.map((m, i) => (
            <div key={m.id || i} className={`chat-bubble ${m.senderType === 'agent' ? 'me' : 'them'}`}>
              {m.message || m.text}
            </div>
          ))}
        </div>
        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            placeholder={activeTicketId ? 'Type a reply…' : 'Select a ticket first'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!activeTicketId}
          />
          <button type="submit" className="btn-primary" disabled={!activeTicketId || !draft.trim()}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
