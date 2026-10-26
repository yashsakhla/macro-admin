import { useState } from 'react';
import { X } from 'lucide-react';
import { listPlans } from '../../api/macropageConnect/plans';
import { createCustomerSubscription, extendCustomerSubscription } from '../../api/macropageConnect/customers';
import { useApiQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import './connect.css';

const CYCLES = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];

// mode: 'extend' (add time to the current subscription) or 'create' (start a new one).
export default function SubscriptionModal({ mode, customerId, customerName, onClose, onDone }) {
  const isExtend = mode === 'extend';
  const { data: plans } = useApiQuery(() => (isExtend ? Promise.resolve([]) : listPlans()), [isExtend]);

  const [planId, setPlanId] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('manual');
  const [months, setMonths] = useState('1');
  const [days, setDays] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  const createMutation = useApiMutation(createCustomerSubscription);
  const extendMutation = useApiMutation(extendCustomerSubscription);
  const busy = createMutation.loading || extendMutation.loading;

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    try {
      if (isExtend) {
        const m = Number(months) || 0;
        const d = Number(days) || 0;
        if (m <= 0 && d <= 0) {
          setFormError('Enter the number of months or days to extend by.');
          return;
        }
        await extendMutation.mutate(customerId, {
          ...(m > 0 && { months: m }),
          ...(d > 0 && { days: d }),
          reason: reason.trim() || undefined,
        });
      } else {
        if (!planId) {
          setFormError('Select a plan.');
          return;
        }
        await createMutation.mutate(customerId, {
          planId,
          billingCycle,
          startDate: startDate || undefined,
          amountPaid: amountPaid !== '' ? Number(amountPaid) : undefined,
          paymentMode,
          note: reason.trim() || undefined,
        });
      }
      onDone?.();
      onClose();
    } catch (err) {
      setFormError(err?.message || 'Could not save the subscription.');
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-panel" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3>{isExtend ? 'Extend subscription' : 'Create subscription'}</h3>
          <button type="button" className="btn-secondary" style={{ padding: 6 }} onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <p className="cell-sub" style={{ marginTop: -8, marginBottom: 16 }}>
          {isExtend
            ? `Adds time to ${customerName}'s current subscription expiry.`
            : `Starts a new subscription for ${customerName}. Replaces any existing one.`}
        </p>

        {isExtend ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-field" style={{ flex: 1 }}>
              <label>Months</label>
              <input type="number" min="0" value={months} onChange={(e) => setMonths(e.target.value)} />
            </div>
            <div className="form-field" style={{ flex: 1 }}>
              <label>Extra days</label>
              <input type="number" min="0" value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
          </div>
        ) : (
          <>
            <div className="form-field">
              <label>Plan</label>
              <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
                <option value="">Select a plan…</option>
                {(plans || []).map((p) => (
                  <option key={p.id} value={String(p.id).toUpperCase()}>{p.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-field" style={{ flex: 1 }}>
                <label>Billing cycle</label>
                <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
                  {CYCLES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-field" style={{ flex: 1 }}>
                <label>Start date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-field" style={{ flex: 1 }}>
                <label>Amount paid (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 = complimentary"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
              <div className="form-field" style={{ flex: 1 }}>
                <label>Payment mode</label>
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                  <option value="manual">Manual / offline</option>
                  <option value="complimentary">Complimentary</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="form-field">
          <label>{isExtend ? 'Reason (optional)' : 'Note (optional)'}</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        {formError && <div className="connect-inline-error">{formError}</div>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : isExtend ? 'Extend' : 'Create subscription'}
          </button>
        </div>
      </form>
    </div>
  );
}
