import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { createLead, listLeads, LEAD_SOURCES, LEAD_SOURCE_LABELS } from '../api/macropageConnect/leads';
import { useApiQuery, useApiMutation } from '../api/macropageConnect/hooks';
import AsyncState from './connect/components/AsyncState';

export default function GenerateLeads() {
  const { product } = useOutletContext();
  const { data: recentLeads, loading, error, refetch } = useApiQuery(
    () => listLeads({ page: 1, limit: 6 }),
    []
  );
  const { mutate: submitLead, loading: submitting } = useApiMutation(createLead);
  const [form, setForm] = useState({ name: '', company: '', phone: '', source: LEAD_SOURCES[0], value: '' });
  const [toast, setToast] = useState('');
  const [formError, setFormError] = useState('');

  const leads = Array.isArray(recentLeads?.data)
    ? recentLeads.data
    : Array.isArray(recentLeads?.items)
      ? recentLeads.items
      : Array.isArray(recentLeads)
        ? recentLeads
        : [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setFormError('');
    try {
      await submitLead({
        name: form.name.trim(),
        company: form.company.trim(),
        phone: form.phone.trim(),
        source: form.source,
        value: Number(form.value) || 0,
      });
      setForm({ name: '', company: '', phone: '', source: LEAD_SOURCES[0], value: '' });
      setToast('Lead added — find it under Manage Leads.');
      setTimeout(() => setToast(''), 3000);
      refetch();
    } catch (err) {
      setFormError(err.message || 'Could not add this lead. Please try again.');
    }
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
        {formError && (
          <div style={{ background: '#FEF2F2', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            {formError}
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
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>
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
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
            <UserPlus size={15} /> {submitting ? 'Adding…' : 'Add lead'}
          </button>
        </form>
      </div>

      <div className="card">
        <span className="card-title">Just captured</span>
        <span className="card-subtitle">Newest leads waiting to be worked</span>
        <AsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && leads.length === 0}
          emptyTitle="No leads yet"
          emptyMessage="Leads you capture will show up here."
          onRetry={refetch}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leads.map((l) => (
              <div key={l._id || l.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div className="cell-primary">{l.name}</div>
                  <div className="cell-sub">{l.company || '—'} · {LEAD_SOURCE_LABELS[l.source] || l.source}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="cell-primary">₹{Number(l.value || 0).toLocaleString('en-IN')}</div>
                  <span className="badge blue">{l.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </AsyncState>
      </div>
    </div>
  );
}
