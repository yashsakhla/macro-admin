import { useState } from 'react';
import { HelpCircle, PlusCircle, Pencil, Trash2, X } from 'lucide-react';
import {
  listHelpFaqs,
  createHelpFaq,
  updateHelpFaq,
  deleteHelpFaq,
} from '../../api/macropageConnect/help';
import { useApiQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';

const EMPTY_FORM = { category: '', order: '', question: '', answer: '', tags: '' };

export default function HelpFaqs() {
  const [category, setCategory] = useState('');
  const { data: faqs, loading, error, refetch } = useApiQuery(
    () => listHelpFaqs(category ? { category } : undefined),
    [category]
  );

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const createMutation = useApiMutation(createHelpFaq);
  const updateMutation = useApiMutation((id, payload) => updateHelpFaq(id, payload));
  const deleteMutation = useApiMutation(deleteHelpFaq);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(faq) {
    setEditingId(faq._id || faq.id);
    setForm({
      category: faq.category || '',
      order: faq.order ?? '',
      question: faq.question || '',
      answer: faq.answer || '',
      tags: (faq.tags || []).join(', '),
    });
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.category.trim() || !form.question.trim() || !form.answer.trim()) {
      setFormError('Category, question and answer are required.');
      return;
    }
    setFormError('');
    const payload = {
      category: form.category.trim(),
      order: form.order !== '' ? Number(form.order) : undefined,
      question: form.question.trim(),
      answer: form.answer.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await updateMutation.mutate(editingId, payload);
      } else {
        await createMutation.mutate(payload);
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Could not save FAQ.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this FAQ? It disappears from the live help center immediately.')) return;
    await deleteMutation.mutate(id);
    refetch();
  }

  return (
    <div>
      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="table-toolbar-count">{faqs?.length ?? 0} FAQs</span>
          <button className="btn-primary" onClick={openCreate}>
            <PlusCircle size={16} /> New FAQ
          </button>
        </div>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && (faqs?.length ?? 0) === 0}
        emptyIcon={HelpCircle}
        emptyTitle="No FAQs yet"
        emptyMessage="Create one to publish it to the live help center."
        onRetry={refetch}
      >
        <div style={{ display: 'grid', gap: 14 }}>
          {(faqs || []).map((faq) => (
            <div key={faq._id || faq.id} className="template-card">
              <div className="detail-row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div className="cell-primary">{faq.question}</div>
                  <div className="cell-sub">
                    {faq.category}{faq.order != null ? ` · order ${faq.order}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="btn-secondary" style={{ padding: 6 }} onClick={() => openEdit(faq)}>
                    <Pencil size={13} />
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: 6, color: 'var(--danger)' }}
                    onClick={() => handleDelete(faq._id || faq.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p style={{ marginTop: 10, color: '#475569', whiteSpace: 'pre-wrap' }}>{faq.answer}</p>
              {(faq.tags || []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                  {faq.tags.map((t) => <span key={t} className="badge gray">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </AsyncState>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>{editingId ? 'Edit FAQ' : 'New FAQ'}</h3>
              <button className="btn-secondary" style={{ padding: 6 }} onClick={() => setShowModal(false)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="detail-row" style={{ gap: 16, flexWrap: 'wrap' }}>
                <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
                  <label>Category</label>
                  <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required />
                </div>
                <div className="form-field" style={{ flex: 1, minWidth: 120 }}>
                  <label>Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} />
                </div>
              </div>
              <div className="form-field">
                <label>Question</label>
                <input value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} required />
              </div>
              <div className="form-field">
                <label>Answer</label>
                <textarea value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} required />
              </div>
              <div className="form-field">
                <label>Tags (comma separated)</label>
                <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
              </div>

              {formError && <div className="connect-inline-error">{formError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.loading || updateMutation.loading}>
                  {editingId ? 'Save changes' : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
