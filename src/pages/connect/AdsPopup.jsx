import { useRef, useState } from 'react';
import { Monitor, PlusCircle, Pencil, Trash2, X } from 'lucide-react';
import { listAds, listActiveAds, createAd, updateAd, deleteAd } from '../../api/macropageConnect/ads';
import { useApiQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import { uploadImageFile, validateImageUpload } from '../../api/macropageConnect/upload';
import AsyncState from './components/AsyncState';
import TagPicker from './components/TagPicker';
import CustomerPicker from './components/CustomerPicker';

const CATEGORIES = ['Alert', 'Notification', 'Invitation', 'Ads', 'Greeting'];
const TARGET_TYPES = ['all', 'tag', 'customer'];

const EMPTY_FORM = {
  title: '',
  desc: '',
  mediaUrl: '',
  category: CATEGORIES[0],
  targetType: 'all',
  targetIds: [],
  isActive: true,
  startDate: '',
  endDate: '',
  priority: '',
};

export default function ConnectAdsPopup() {
  const { data: adsRaw, loading, error, refetch } = useApiQuery(() => listAds(), []);
  const ads = adsRaw?.map((ad) => ({ ...ad, id: ad.id ?? ad._id }));
  const [previewCustomerId, setPreviewCustomerId] = useState('');
  const { data: activeAdsRaw, loading: activeLoading } = useApiQuery(
    () => listActiveAds(previewCustomerId || undefined),
    [previewCustomerId]
  );
  const activeAds = activeAdsRaw?.map((ad) => ({ ...ad, id: ad.id ?? ad._id }));

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const mediaInputRef = useRef(null);

  const createMutation = useApiMutation(createAd);
  const updateMutation = useApiMutation((id, payload) => updateAd(id, payload));
  const deleteMutation = useApiMutation(deleteAd);

  async function handleMediaFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validationError = validateImageUpload(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError('');
    setUploadingMedia(true);
    try {
      const uploadedUrl = await uploadImageFile(file, { onProgress: () => undefined });
      setForm((f) => ({ ...f, mediaUrl: uploadedUrl }));
      setFormError('');
    } catch (err) {
      setUploadError(err?.message || 'Could not upload image.');
    } finally {
      setUploadingMedia(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(ad) {
    setEditingId(ad.id);
    setForm({
      title: ad.title || '',
      desc: ad.description || '',
      mediaUrl: ad.mediaUrl || '',
      category: ad.category || CATEGORIES[0],
      targetType: ad.targetType || 'all',
      targetIds: ad.targetIds || [],
      isActive: ad.isActive ?? true,
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      priority: ad.priority ?? '',
    });
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.mediaUrl.trim()) {
      setFormError('Title and media URL are required.');
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.desc.trim(),
      mediaUrl: form.mediaUrl.trim(),
      category: form.category,
      type: 'popup',
      isActive: form.isActive,
      ...(form.targetType !== 'all' && { targetType: form.targetType, targetIds: form.targetIds }),
      ...(form.startDate && { startDate: form.startDate }),
      ...(form.endDate && { endDate: form.endDate }),
      ...(form.priority !== '' && { priority: Number(form.priority) }),
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
      setFormError(err?.message || 'Could not save ad.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this ad?')) return;
    await deleteMutation.mutate(id);
    refetch();
  }

  return (
    <div>
      <div className="page-toolbar">
        <span className="table-toolbar-count">{ads?.length ?? 0} ads configured</span>
        <button className="btn-primary" onClick={openCreate}>
          <PlusCircle size={16} /> New ad
        </button>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && (ads?.length ?? 0) === 0}
        emptyIcon={Monitor}
        emptyTitle="No ads yet"
        emptyMessage="Create an Alert, Notification, Invitation, Ads or Greeting above."
        onRetry={refetch}
      >
        <div className="data-table-wrap" style={{ marginBottom: 22 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Target</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(ads || []).map((ad) => (
                <tr key={ad.id}>
                  <td className="cell-primary">{ad.title}</td>
                  <td>{ad.category}</td>
                  <td>{ad.targetType || 'all'}</td>
                  <td><span className={`badge ${ad.isActive ? 'green' : 'gray'}`}>{ad.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary" style={{ padding: 6 }} onClick={() => openEdit(ad)}>
                      <Pencil size={13} />
                    </button>
                    <button className="btn-secondary" style={{ padding: 6, color: 'var(--danger)' }} onClick={() => handleDelete(ad.id)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncState>

      <div className="card">
        <span className="card-title">Active ads preview</span>
        <span className="card-subtitle">What's live right now — optionally scoped to one customer</span>
        <input
          className="search-input"
          style={{ marginBottom: 14 }}
          placeholder="Filter by customer ID (optional)"
          value={previewCustomerId}
          onChange={(e) => setPreviewCustomerId(e.target.value)}
        />
        <AsyncState
          loading={activeLoading}
          empty={!activeLoading && (activeAds?.length ?? 0) === 0}
          emptyIcon={Monitor}
          emptyTitle="No active ads"
        >
          <div style={{ display: 'grid', gap: 14 }}>
            {(activeAds || []).map((ad) => (
              <div key={ad.id} className="popup-preview">
                <div className="popup-header">
                  <Monitor size={18} /> {ad.title}
                </div>
                <div className="popup-body">
                  <img src={ad.mediaUrl} alt={ad.title} style={{ maxWidth: '100%', borderRadius: 'var(--radius-sm)' }} />
                </div>
                <div className="popup-footer">
                  <span className="badge gray">{ad.category}</span>
                </div>
              </div>
            ))}
          </div>
        </AsyncState>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>{editingId ? 'Edit ad' : 'New ad'}</h3>
              <button className="btn-secondary" style={{ padding: 6 }} onClick={() => setShowModal(false)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="form-field">
                <label>Media URL</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={form.mediaUrl}
                    onChange={(e) => setForm((f) => ({ ...f, mediaUrl: e.target.value }))}
                    placeholder="https://…"
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn-secondary" onClick={() => mediaInputRef.current?.click()} disabled={uploadingMedia}>
                    {uploadingMedia ? 'Uploading…' : 'Upload image'}
                  </button>
                  <input ref={mediaInputRef} type="file" accept="image/*" hidden onChange={handleMediaFileSelected} />
                </div>
                {form.mediaUrl && (
                  <img
                    src={form.mediaUrl}
                    alt="Ad preview"
                    style={{ maxWidth: '100%', maxHeight: 180, marginTop: 10, borderRadius: 8, objectFit: 'cover' }}
                  />
                )}
                {uploadError && <div className="connect-inline-error" style={{ marginTop: 10 }}>{uploadError}</div>}
              </div>
              <div className="detail-row" style={{ gap: 16, flexWrap: 'wrap' }}>
                <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
                  <label>Priority</label>
                  <input type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} />
                </div>
              </div>
              <div className="detail-row" style={{ gap: 16, flexWrap: 'wrap' }}>
                <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
                  <label>Start date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
                  <label>End date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
              <div className="form-field">
                <label>Target</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {TARGET_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className="btn-secondary"
                      style={
                        form.targetType === type
                          ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                          : undefined
                      }
                      onClick={() => setForm((f) => ({ ...f, targetType: type, targetIds: [] }))}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {form.targetType === 'tag' && (
                  <TagPicker value={form.targetIds} onChange={(ids) => setForm((f) => ({ ...f, targetIds: ids }))} />
                )}
                {form.targetType === 'customer' && (
                  <CustomerPicker multiSelect value={form.targetIds} onChange={(ids) => setForm((f) => ({ ...f, targetIds: ids }))} />
                )}
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="ad-active"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="ad-active" style={{ margin: 0 }}>Active</label>
              </div>

              {formError && <div className="connect-inline-error">{formError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.loading || updateMutation.loading}>
                  {editingId ? 'Save changes' : 'Create ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
