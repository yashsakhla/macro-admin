import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bell, Tag, Send, Users } from 'lucide-react';
import { getProductData } from '../data/mockData';

export default function PushNotifications() {
  const { product } = useOutletContext();
  const { customers } = getProductData(product.id);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetTag, setTargetTag] = useState('All customers');
  const [sent, setSent] = useState(false);

  const uniqueTags = useMemo(() => {
    const tags = customers.flatMap((c) => c.tags || []);
    return Array.from(new Set(tags));
  }, [customers]);

  const targets = ['All customers', ...uniqueTags];

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 3200);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 22 }}>
        <span className="card-title">Send push notification</span>
        <span className="card-subtitle">Create a broadcast or tag-targeted message for Macropage Connect customers</span>
        <div className="form-field">
          <label>Notification title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New product update" />
        </div>
        <div className="form-field">
          <label>Message body</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write the notification text here." />
        </div>
        <div className="form-field">
          <label>Send to</label>
          <select value={targetTag} onChange={(e) => setTargetTag(e.target.value)}>
            {targets.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn-primary" type="button" onClick={handleSend}>
            <Send size={16} /> Send notification
          </button>
          {sent && <span className="badge green">Notification queued</span>}
        </div>
      </div>

      <div className="section-row">
        <div className="card">
          <span className="card-title">Recipient preview</span>
          <span className="card-subtitle">Customers included in this broadcast</span>
          <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
            <div className="detail-row">
              <div>
                <div className="cell-primary">Target group</div>
                <div className="cell-sub">{targetTag}</div>
              </div>
              <div>
                <div className="cell-primary">Customers</div>
                <div className="cell-sub">{targetTag === 'All customers' ? customers.length : customers.filter((c) => c.tags.includes(targetTag)).length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <span className="card-title">Tag categories</span>
          <span className="card-subtitle">Tags can be used to segment customers for notifications</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
            {targets.slice(1).map((tag) => (
              <span key={tag} className="badge gray">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
