import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Layers, Pencil, X } from 'lucide-react';
import { listPlans, updatePlan } from '../../api/macropageConnect/plans';
import { useApiQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';

const CYCLES = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];

function emptyCyclePricing() {
  return { price: '', billedAs: '', savings: '' };
}

function planToForm(plan) {
  return {
    name: plan.name || '',
    desc: plan.desc || '',
    badge: plan.badge || '',
    cta: plan.cta || '',
    ctaHref: plan.ctaHref || '',
    highlight: !!plan.highlight,
    monthly: { ...emptyCyclePricing(), ...(plan.pricing?.monthly || {}) },
    quarterly: { ...emptyCyclePricing(), ...(plan.pricing?.quarterly || {}) },
    yearly: { ...emptyCyclePricing(), ...(plan.pricing?.yearly || {}) },
    features: (plan.features || []).join('\n'),
    notIncluded: (plan.notIncluded || []).join('\n'),
  };
}

function formToPlanPatch(form) {
  const patch = {};

  if (form.name.trim()) patch.name = form.name.trim();
  if (form.desc.trim()) patch.desc = form.desc.trim();
  patch.badge = form.badge.trim() || null;
  if (form.cta.trim()) patch.cta = form.cta.trim();
  if (form.ctaHref.trim()) patch.ctaHref = form.ctaHref.trim();
  patch.highlight = !!form.highlight;

  const pricing = {};
  CYCLES.forEach(({ key }) => {
    const cycle = form[key];
    const cyclePatch = {};

    if (cycle.price !== '') {
      const priceValue = Number(cycle.price);
      if (!Number.isNaN(priceValue)) cyclePatch.price = priceValue;
    }
    if (cycle.billedAs.trim()) cyclePatch.billedAs = cycle.billedAs.trim();
    if (cycle.savings.trim()) cyclePatch.savings = cycle.savings.trim();

    if (Object.keys(cyclePatch).length > 0) {
      pricing[key] = cyclePatch;
    }
  });

  if (Object.keys(pricing).length > 0) {
    patch.pricing = pricing;
  }

  const features = form.features.split('\n').map((f) => f.trim()).filter(Boolean);
  if (features.length > 0 || form.features.trim() === '') {
    patch.features = features;
  }

  const notIncluded = form.notIncluded.split('\n').map((f) => f.trim()).filter(Boolean);
  if (notIncluded.length > 0 || form.notIncluded.trim() === '') {
    patch.notIncluded = notIncluded;
  }

  return patch;
}

export default function ConnectPlans() {
  const { product } = useOutletContext();
  const { data: plans, loading, error, refetch } = useApiQuery(() => listPlans(), []);
  const { mutate: saveMutate, loading: saving, error: saveError } = useApiMutation(updatePlan);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(null);

  const displayPlans = plans || [];

  function openEdit(plan) {
    setEditingPlan(plan);
    setForm(planToForm(plan));
  }

  function closeEdit() {
    setEditingPlan(null);
    setForm(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!editingPlan) return;

    const planId = String(editingPlan.planId || editingPlan.id || editingPlan.name || '').toUpperCase();
    const payload = formToPlanPatch(form);

    try {
      await saveMutate(planId, payload);
      closeEdit();
      refetch();
    } catch {
      // saveError already holds the message; keep the modal open so the user can retry.
    }
  }

  function updateCycle(cycleKey, field, value) {
    setForm((prev) => ({ ...prev, [cycleKey]: { ...prev[cycleKey], [field]: value } }));
  }

  return (
    <div>
      <div className="page-toolbar">
        <span className="table-toolbar-count">
          {displayPlans.length} plans in the {product.name} catalog
        </span>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && displayPlans.length === 0}
        emptyIcon={Layers}
        emptyTitle="No plans configured"
        emptyMessage="The pricing catalog will appear here once plans are set up on the backend."
        onRetry={refetch}
      >
        <div className="plan-grid">
          {displayPlans.map((plan) => {
            const monthly = plan.pricing?.monthly;
            const quarterly = plan.pricing?.quarterly;
            const yearly = plan.pricing?.yearly;

            return (
              <div key={plan.id} className={`plan-card${plan.highlight ? ' featured' : ''}`}>
                {plan.badge && <div className="badge">{plan.badge}</div>}
                <div className="plan-name">{plan.name}</div>
                {plan.desc && <div className="plan-subs">{plan.desc}</div>}
                <div className="plan-price">
                  {monthly?.billedAs || 'Custom pricing'}
                </div>
                {quarterly?.billedAs && (
                  <div className="plan-subs">
                    {quarterly.billedAs}
                    {quarterly.savings ? ` · ${quarterly.savings}` : ''}
                  </div>
                )}
                {yearly?.billedAs && (
                  <div className="plan-subs">
                    {yearly.billedAs}
                    {yearly.savings ? ` · ${yearly.savings}` : ''}
                  </div>
                )}
                <ul>
                  {(plan.features || []).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                  {(plan.notIncluded || []).map((f) => (
                    <li key={f} style={{ opacity: 0.5, textDecoration: 'line-through' }}>{f}</li>
                  ))}
                </ul>
                <button className="btn-secondary" onClick={() => openEdit(plan)}>
                  <Pencil size={13} /> Edit plan
                </button>
              </div>
            );
          })}
        </div>
      </AsyncState>

      {editingPlan && form && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>Edit {editingPlan.name}</h3>
              <button className="btn-secondary" style={{ padding: 6 }} onClick={closeEdit}>
                <X size={14} />
              </button>
            </div>
            {saveError && (
              <div className="plan-subs" style={{ marginBottom: 12, color: 'var(--danger, #dc2626)' }}>
                {saveError.message || 'Failed to save. Try again.'}
              </div>
            )}
            <form onSubmit={handleSave}>
              <div className="form-field">
                <label>Plan name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Description</label>
                <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Badge (blank for none)</label>
                <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Most Popular" />
              </div>
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={form.highlight}
                    onChange={(e) => setForm({ ...form, highlight: e.target.checked })}
                    style={{ marginRight: 6 }}
                  />
                  Highlight this plan
                </label>
              </div>
              <div className="form-field">
                <label>CTA label</label>
                <input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
              </div>
              <div className="form-field">
                <label>CTA link</label>
                <input value={form.ctaHref} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} />
              </div>

              {CYCLES.map(({ key, label }) => (
                <fieldset key={key} style={{ border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <legend style={{ padding: '0 6px' }}>{label} pricing</legend>
                  <div className="form-field">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      value={form[key].price}
                      onChange={(e) => updateCycle(key, 'price', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Billed as (display text)</label>
                    <input
                      value={form[key].billedAs}
                      onChange={(e) => updateCycle(key, 'billedAs', e.target.value)}
                      placeholder="e.g. ₹1,999/month"
                    />
                  </div>
                  <div className="form-field">
                    <label>Savings label (optional)</label>
                    <input
                      value={form[key].savings}
                      onChange={(e) => updateCycle(key, 'savings', e.target.value)}
                      placeholder="e.g. Save 10%"
                    />
                  </div>
                </fieldset>
              ))}

              <div className="form-field">
                <label>Features included (one per line)</label>
                <textarea
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  rows={5}
                />
              </div>
              <div className="form-field">
                <label>Not included (one per line)</label>
                <textarea
                  value={form.notIncluded}
                  onChange={(e) => setForm({ ...form, notIncluded: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeEdit} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
