import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, PlusCircle } from 'lucide-react';
import { getProductData } from '../data/mockData';

const defaultTemplates = [
  { id: 'tpl-1', name: 'Renewal reminder', subject: 'Your plan renews soon', body: 'Hi {{customer}}, your plan will renew on {{renewal_date}}. Please ensure your payment method is up to date.' },
  { id: 'tpl-2', name: 'Campaign launch', subject: 'New campaign ready', body: 'Your campaign is ready to launch. Review the settings and publish when ready.' },
];

export default function Templates() {
  const { product } = useOutletContext();
  const { customers } = getProductData(product.id);
  const [templates, setTemplates] = useState(defaultTemplates);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleCreate = () => {
    if (!name.trim() || !subject.trim() || !body.trim()) return;
    setTemplates((prev) => [
      { id: `tpl-${prev.length + 1}`, name, subject, body },
      ...prev,
    ]);
    setName('');
    setSubject('');
    setBody('');
  };

  const customerCount = customers.length;

  return (
    <div>
      <div className="card" style={{ marginBottom: 22 }}>
        <span className="card-title">Create template</span>
        <span className="card-subtitle">Build reusable messages for all customers</span>
        <div className="form-field">
          <label>Template name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Subscription follow-up" />
        </div>
        <div className="form-field">
          <label>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Hi {{customer}}," />
        </div>
        <div className="form-field">
          <label>Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Use tags like {{customer}} and {{renewal_date}}." />
        </div>
        <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn-primary" type="button" onClick={handleCreate}>
            <PlusCircle size={16} /> Create template
          </button>
          <span className="badge gray">Used by {customerCount} customers</span>
        </div>
      </div>

      <div className="card">
        <span className="card-title">Saved templates</span>
        <span className="card-subtitle">Ready to send to customers after review</span>
        <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
          {templates.map((tpl) => (
            <div key={tpl.id} className="template-card">
              <div className="detail-row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div className="cell-primary">{tpl.name}</div>
                  <div className="cell-sub">{tpl.subject}</div>
                </div>
                <span className="badge blue">Ready</span>
              </div>
              <p style={{ marginTop: 10, color: '#475569' }}>{tpl.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
