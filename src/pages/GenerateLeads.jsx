import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { getProductData } from '../data/mockData';

const SOURCES = ['Website Form', 'Referral', 'Cold Outreach', 'Trade Show', 'Partner', 'Ad Campaign'];

export default function GenerateLeads() {
  const { product } = useOutletContext();
  const data = getProductData(product.id);
  const [leads, setLeads] = useState(data.leads.slice(0, 6));
  const [form, setForm] = useState({ name: '', company: '', phone: '', source: SOURCES[0], value: '' });
  const [toast, setToast] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    const lead = {
      id: `${product.id}-lead-${Date.now()}`,
      name: form.name.trim(),
      company: form.company.trim() || '—',
      phone: form.phone.trim(),
      source: form.source,
      stage: 'New',
      value: Number(form.value) || 0,
    };
    setLeads((prev) => [lead, ...prev]);
    setForm({ name: '', company: '', phone: '', source: SOURCES[0], value: '' });
    setToast('Lead added — find it under Manage Leads.');
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <div className="section-row">
      <div className="card">
        <span className="card-title">Capture a new lead</span>
        <span className="card-subtitle">Add a prospect for {product.name} into the pipeline</span>

        {toast && (
          <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            {toast}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Full name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rohan Verma"
              required
            />
          </div>
          <div className="form-field">
            <label>Company</label>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="e.g. Sunrise Fuels Pvt Ltd"
            />
          </div>
          <div className="form-field">
            <label>Phone number</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 9XXXXXXXXX"
              required
            />
          </div>
          <div className="form-field">
            <label>Lead source</label>
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Estimated deal value (₹)</label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="e.g. 45000"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <UserPlus size={15} /> Add lead
          </button>
        </form>
      </div>

      <div className="card">
        <span className="card-title">Just captured</span>
        <span className="card-subtitle">Newest leads waiting to be worked</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {leads.map((l) => (
            <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div>
                <div className="cell-primary">{l.name}</div>
                <div className="cell-sub">{l.company} · {l.source}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="cell-primary">₹{l.value.toLocaleString('en-IN')}</div>
                <span className="badge blue">{l.stage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
