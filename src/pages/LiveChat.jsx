import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send } from 'lucide-react';
import { getProductData } from '../data/mockData';

const APPROVED_TEMPLATES = [
  { id: 'tpl-1', label: 'Order update template', text: 'Hi {{name}}, your order is confirmed and will be delivered tomorrow.' },
  { id: 'tpl-2', label: 'Renewal reminder', text: 'Hi {{name}}, your subscription renews on {{date}}. Please keep your payment method active.' },
  { id: 'tpl-3', label: 'Account verification', text: 'Hi {{name}}, your account setup is complete. Reply to this message if you need any help.' },
];

export default function LiveChat() {
  const { product } = useOutletContext();
  const { chats } = getProductData(product.id);
  const [chatList, setChatList] = useState(chats);
  const [activeId, setActiveId] = useState(chats[0]?.id);
  const [draft, setDraft] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(APPROVED_TEMPLATES[0].id);
  const [conversations, setConversations] = useState(() =>
    Object.fromEntries(
      chats.map((c) => [
        c.id,
        [
          { from: 'them', text: c.lastMessage },
        ],
      ])
    )
  );

  const active = chatList.find((c) => c.id === activeId);
  const messages = conversations[activeId] || [];
  const isInitiated = active?.initiated;

  function sendMessage(e) {
    e.preventDefault();
    if (!active) return;

    if (!isInitiated) {
      const template = APPROVED_TEMPLATES.find((tpl) => tpl.id === selectedTemplate);
      if (!template) return;
      setConversations((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), { from: 'me', text: template.text }],
      }));
      setChatList((prev) => prev.map((c) => (c.id === activeId ? { ...c, initiated: true } : c)));
      setDraft('');
      return;
    }

    if (!draft.trim()) return;
    setConversations((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), { from: 'me', text: draft.trim() }],
    }));
    setDraft('');
  }

  return (
    <div className="chat-shell">
      <div className="chat-list scrollbar-thin">
        {chatList.map((c) => (
          <div
            key={c.id}
            className={`chat-list-item${c.id === activeId ? ' active' : ''}`}
            onClick={() => setActiveId(c.id)}
          >
            <div className="chat-avatar">{c.name[0]}</div>
            <div className="chat-list-info">
              <div className="chat-name">
                <span>{c.name}</span>
                <span style={{ color: 'var(--ink-500)', fontWeight: 400 }}>{c.time}</span>
              </div>
              <div className="chat-preview">{c.lastMessage}</div>
            </div>
            {c.unread && <div className="chat-unread-dot" />}
          </div>
        ))}
      </div>

      <div className="chat-window">
        <div className="chat-window-header">{active?.name}</div>
        {!isInitiated && (
          <div style={{ padding: '14px 18px', background: '#fef3f2', borderBottom: '1px solid var(--border)', color: '#991b1b' }}>
            This contact has no active inbox conversation yet. You cannot initiate chat with a normal message. Use an approved Meta template to start the conversation.
          </div>
        )}
        <div className="chat-messages scrollbar-thin">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.from}`}>
              {m.text}
            </div>
          ))}
        </div>
        <form className="chat-input-row" onSubmit={sendMessage}>
          {isInitiated ? (
            <input
              placeholder="Type a reply…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          ) : (
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '999px', border: '1px solid var(--border)', fontSize: 13.5 }}
            >
              {APPROVED_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>{tpl.label}</option>
              ))}
            </select>
          )}
          <button type="submit" className="btn-primary" disabled={!isInitiated && !selectedTemplate}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
