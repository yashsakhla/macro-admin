import { useRef, useState } from 'react';
import { FileText, PlusCircle, Pencil, Trash2, X, UploadCloud } from 'lucide-react';
import {
  listHelpDocs,
  createHelpDoc,
  updateHelpDoc,
  deleteHelpDoc,
} from '../../api/macropageConnect/help';
import { uploadTutorialFile, validateTutorialFile } from '../../api/macropageConnect/upload';
import { useApiQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';
import { renderMarkdown } from './utils/markdown';

function slugify(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mediaSnippet(file, url) {
  if (file.type.startsWith('image/')) return `\n\n![${file.name}](${url})\n`;
  if (file.type.startsWith('video/')) return `\n\n[Watch: ${file.name}](${url})\n`;
  return `\n\n[View: ${file.name}](${url})\n`;
}

const EMPTY_FORM = { title: '', slug: '', category: '', order: '', tags: '', content: '' };

export default function HelpDocs() {
  const [category, setCategory] = useState('');
  const { data: docs, loading, error, refetch } = useApiQuery(
    () => listHelpDocs(category ? { category } : undefined),
    [category]
  );

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);

  const createMutation = useApiMutation(createHelpDoc);
  const updateMutation = useApiMutation((id, payload) => updateHelpDoc(id, payload));
  const deleteMutation = useApiMutation(deleteHelpDoc);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError('');
    setUploadError('');
    setShowModal(true);
  }

  function openEdit(doc) {
    setEditingId(doc._id || doc.id);
    setForm({
      title: doc.title || '',
      slug: doc.slug || '',
      category: doc.category || '',
      order: doc.order ?? '',
      tags: (doc.tags || []).join(', '),
      content: doc.content || '',
    });
    setSlugTouched(true);
    setFormError('');
    setUploadError('');
    setShowModal(true);
  }

  function handleTitleChange(value) {
    setForm((f) => ({ ...f, title: value, slug: slugTouched ? f.slug : slugify(value) }));
  }

  async function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const validationError = validateTutorialFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    setUploadError('');
    setUploadProgress(0);
    try {
      const result = await uploadTutorialFile(file, { onProgress: setUploadProgress });
      setForm((f) => ({ ...f, content: f.content + mediaSnippet(file, result.url) }));
    } catch (err) {
      setUploadError(err?.message || 'Could not upload file.');
    } finally {
      setUploadProgress(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.category.trim() || !form.content.trim()) {
      setFormError('Title, slug, category and content are required.');
      return;
    }
    setFormError('');
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category.trim(),
      order: form.order !== '' ? Number(form.order) : undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      content: form.content,
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
      setFormError(err?.message || 'Could not save doc.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this help doc? It disappears from the live help center immediately.')) return;
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
          <span className="table-toolbar-count">{docs?.length ?? 0} docs</span>
          <button className="btn-primary" onClick={openCreate}>
            <PlusCircle size={16} /> New doc
          </button>
        </div>
      </div>

      <div className="data-table-wrap">
        <AsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && (docs?.length ?? 0) === 0}
          emptyIcon={FileText}
          emptyTitle="No help docs yet"
          emptyMessage="Create one to publish it to the live help center."
          onRetry={refetch}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Order</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(docs || []).map((doc) => (
                <tr key={doc._id || doc.id}>
                  <td>
                    <div className="cell-primary">{doc.title}</div>
                    <div className="cell-sub">/{doc.slug}</div>
                  </td>
                  <td>{doc.category}</td>
                  <td>{doc.order ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(doc.tags || []).length === 0
                        ? '—'
                        : doc.tags.map((t) => <span key={t} className="badge gray">{t}</span>)}
                    </div>
                  </td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary" style={{ padding: 6 }} onClick={() => openEdit(doc)}>
                      <Pencil size={13} />
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: 6, color: 'var(--danger)' }}
                      onClick={() => handleDelete(doc._id || doc.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AsyncState>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>{editingId ? 'Edit help doc' : 'New help doc'}</h3>
              <button className="btn-secondary" style={{ padding: 6 }} onClick={() => setShowModal(false)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="detail-row" style={{ gap: 16, flexWrap: 'wrap' }}>
                <div className="form-field" style={{ flex: 2, minWidth: 200 }}>
                  <label>Title</label>
                  <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
                </div>
                <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
                  <label>Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setForm((f) => ({ ...f, slug: e.target.value }));
                    }}
                    required
                  />
                </div>
              </div>
              <div className="detail-row" style={{ gap: 16, flexWrap: 'wrap' }}>
                <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
                  <label>Category</label>
                  <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required />
                </div>
                <div className="form-field" style={{ flex: 1, minWidth: 120 }}>
                  <label>Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} />
                </div>
                <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
                  <label>Tags (comma separated)</label>
                  <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
                </div>
              </div>

              <div className="form-field">
                <label>Content (Markdown)</label>
                <textarea
                  style={{ minHeight: 160, fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder={'# Steps\n\n1. Open settings\n2. Click connect'}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <button type="button" className="btn-secondary" onClick={handleUploadClick} disabled={uploadProgress !== null}>
                  <UploadCloud size={14} /> Attach image / video / PDF
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileSelected}
                />
                <span className="cell-sub">Max 100MB — inserted as a Markdown link/image at the end of the content.</span>
              </div>
              {uploadProgress !== null && (
                <div className="connect-upload-progress" style={{ marginBottom: 14 }}>
                  <div className="connect-upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
              {uploadError && <div className="connect-inline-error">{uploadError}</div>}

              <div className="form-field">
                <label>Preview</label>
                <div
                  className="connect-markdown-preview"
                  style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) || '<p class="cell-sub">Nothing to preview yet.</p>' }}
                />
              </div>

              {formError && <div className="connect-inline-error">{formError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.loading || updateMutation.loading}>
                  {editingId ? 'Save changes' : 'Publish doc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
