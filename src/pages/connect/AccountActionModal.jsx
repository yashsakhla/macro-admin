import { useState } from 'react';
import { X } from 'lucide-react';
import { suspendCustomer, deleteCustomer } from '../../api/macropageConnect/customers';
import { useApiMutation } from '../../api/macropageConnect/hooks';
import './connect.css';

// mode: 'suspend' (reversible, needs a reason) or 'delete' (also needs the customer's email typed to confirm).
export default function AccountActionModal({ mode, customerId, customerName, customerEmail, onClose, onDone }) {
  const isDelete = mode === 'delete';
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [formError, setFormError] = useState('');
  const mutation = useApiMutation(isDelete ? deleteCustomer : suspendCustomer);

  const confirmTarget = (customerEmail || '').trim().toLowerCase();
  const confirmed = !isDelete || (confirmTarget !== '' && confirmText.trim().toLowerCase() === confirmTarget);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) {
      setFormError('A reason is required.');
      return;
    }
    setFormError('');
    try {
      await mutation.mutate(
        customerId,
        isDelete ? { reason: reason.trim(), confirmEmail: confirmText.trim() } : { reason: reason.trim() }
      );
      onDone?.();
      onClose();
    } catch (err) {
      setFormError(err?.message || 'Action failed.');
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-panel" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3>{isDelete ? 'Delete account' : 'Suspend account'}</h3>
          <button type="button" className="btn-secondary" style={{ padding: 6 }} onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <p className="cell-sub" style={{ marginTop: -8, marginBottom: 16 }}>
          {isDelete
            ? `This removes ${customerName}'s account and stops all messaging. This cannot be undone.`
            : `${customerName} will be blocked from logging in and sending messages until you unsuspend the account.`}
        </p>

        <div className="form-field">
          <label>Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        {isDelete && (
          <div className="form-field">
            <label>Type <strong>{customerEmail}</strong> to confirm</label>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
          </div>
        )}

        {formError && <div className="connect-inline-error">{formError}</div>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            type="submit"
            className="btn-primary"
            style={{ background: 'var(--danger)' }}
            disabled={mutation.loading || !confirmed}
          >
            {mutation.loading ? 'Working…' : isDelete ? 'Delete account' : 'Suspend account'}
          </button>
        </div>
      </form>
    </div>
  );
}
