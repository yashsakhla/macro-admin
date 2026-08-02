import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Monitor, PlusCircle, Clock4 } from 'lucide-react';

export default function AdsPopup() {
  const { product } = useOutletContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [page, setPage] = useState('Homepage');
  const [status, setStatus] = useState('Draft');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 22 }}>
        <span className="card-title">Create ads popup</span>
        <span className="card-subtitle">Define a portal popup for Macropage Connect users</span>
        <div className="form-field">
          <label>Popup title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Special upgrade offer" />
        </div>
        <div className="form-field">
          <label>Popup content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Highlight the offer and call to action." />
        </div>
        <div className="detail-row" style={{ gap: 16, flexWrap: 'wrap' }}>
          <div className="form-field" style={{ flex: 1, minWidth: 200 }}>
            <label>Show on page</label>
            <select value={page} onChange={(e) => setPage(e.target.value)}>
              <option>Homepage</option>
              <option>Dashboard</option>
              <option>Customers</option>
              <option>Support</option>
            </select>
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 200 }}>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Draft</option>
              <option>Published</option>
              <option>Paused</option>
            </select>
          </div>
        </div>
        <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn-primary" type="button" onClick={handleSave}>
            <PlusCircle size={16} /> Save popup
          </button>
          {saved && <span className="badge green">Popup saved</span>}
        </div>
      </div>

      <div className="card">
        <span className="card-title">Live preview</span>
        <span className="card-subtitle">How the popup will appear in {product.name}</span>
        <div className="popup-preview">
          <div className="popup-header">
            <Monitor size={18} /> {title || 'Promo popup title'}
          </div>
          <div className="popup-body">{content || 'Promo description will appear here. Add a strong call to action.'}</div>
          <div className="popup-footer">
            <button className="btn-primary" type="button">Learn more</button>
            <span>{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
