import { useState } from 'react';
import { PlayCircle, PlusCircle, Upload, Pencil, Trash2, X } from 'lucide-react';
import { listVideos, createVideo, updateVideo, deleteVideo } from '../../api/macropageConnect/videos';
import { submitTutorialVideoUrl } from '../../api/macropageConnect/upload';
import { useApiQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';

const EMPTY_FORM = { title: '', url: '', order: '' };
const EMPTY_URL_FORM = { title: '', url: '', order: '' };

function youtubeThumb(url) {
  const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
}

export default function ConnectVideos() {
  const { data: videos, loading, error, refetch } = useApiQuery(listVideos, []);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const createMutation = useApiMutation(createVideo);
  const updateMutation = useApiMutation((id, payload) => updateVideo(id, payload));
  const deleteMutation = useApiMutation(deleteVideo);

  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlForm, setUrlForm] = useState(EMPTY_URL_FORM);
  const [urlFormError, setUrlFormError] = useState('');
  const submitUrlMutation = useApiMutation(submitTutorialVideoUrl);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(video) {
    setEditingId(video._id || video.id);
    setForm({
      title: video.title || '',
      url: video.url || '',
      order: video.order ?? '',
    });
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) {
      setFormError('Title and video URL are required.');
      return;
    }
    setFormError('');
    const payload = {
      url: form.url.trim(),
      title: form.title.trim(),
      order: form.order !== '' ? Number(form.order) : undefined,
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
      setFormError(err?.message || 'Could not save video.');
    }
  }

  function openUrlUpload() {
    setUrlForm(EMPTY_URL_FORM);
    setUrlFormError('');
    setShowUrlModal(true);
  }

  async function handleUrlSubmit(e) {
    e.preventDefault();
    if (!urlForm.title.trim() || !urlForm.url.trim()) {
      setUrlFormError('Title and video URL are required.');
      return;
    }
    setUrlFormError('');
    const payload = {
      url: urlForm.url.trim(),
      title: urlForm.title.trim(),
      order: urlForm.order !== '' ? Number(urlForm.order) : undefined,
    };
    try {
      await submitUrlMutation.mutate(payload);
      setShowUrlModal(false);
      refetch();
    } catch (err) {
      setUrlFormError(err?.message || 'Could not upload tutorial video.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this video? It disappears from the live product immediately.')) return;
    await deleteMutation.mutate(id);
    refetch();
  }

  const sortedVideos = [...(videos || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div>
      <div className="page-toolbar">
        <span className="table-toolbar-count">{videos?.length ?? 0} videos</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={openUrlUpload}>
            <Upload size={16} /> Upload tutorial video
          </button>
          <button className="btn-primary" onClick={openCreate}>
            <PlusCircle size={16} /> New video
          </button>
        </div>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && (videos?.length ?? 0) === 0}
        emptyIcon={PlayCircle}
        emptyTitle="No videos yet"
        emptyMessage="Add a YouTube link to publish it to the live product."
        onRetry={refetch}
      >
        <div className="section-row" style={{ flexWrap: 'wrap' }}>
          {sortedVideos.map((video) => {
            const id = video._id || video.id;
            const thumb = youtubeThumb(video.url);
            return (
              <div key={id} className="card" style={{ width: 260 }}>
                <a href={video.url} target="_blank" rel="noreferrer">
                  {thumb ? (
                    <img src={thumb} alt={video.title} style={{ width: '100%', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: 140,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PlayCircle size={28} style={{ opacity: 0.5 }} />
                    </div>
                  )}
                </a>
                <div className="card-title" style={{ marginTop: 10 }}>{video.title}</div>
                <div className="cell-sub">Order {video.order ?? '—'}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn-secondary" style={{ padding: 6 }} onClick={() => openEdit(video)}>
                    <Pencil size={13} />
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: 6, color: 'var(--danger)' }}
                    onClick={() => handleDelete(id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </AsyncState>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>{editingId ? 'Edit video' : 'New video'}</h3>
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
                <label>YouTube URL</label>
                <input
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>
              <div className="form-field">
                <label>Order</label>
                <input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} />
              </div>

              {formError && <div className="connect-inline-error">{formError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.loading || updateMutation.loading}>
                  {editingId ? 'Save changes' : 'Add video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUrlModal && (
        <div className="modal-backdrop" onClick={() => setShowUrlModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>Upload tutorial video</h3>
              <button className="btn-secondary" style={{ padding: 6 }} onClick={() => setShowUrlModal(false)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleUrlSubmit}>
              <div className="form-field">
                <label>Title</label>
                <input
                  value={urlForm.title}
                  onChange={(e) => setUrlForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Getting started"
                  required
                />
              </div>
              <div className="form-field">
                <label>YouTube URL</label>
                <input
                  value={urlForm.url}
                  onChange={(e) => setUrlForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://youtube.com/..."
                  required
                />
              </div>
              <div className="form-field">
                <label>Order</label>
                <input
                  type="number"
                  value={urlForm.order}
                  onChange={(e) => setUrlForm((f) => ({ ...f, order: e.target.value }))}
                />
              </div>

              {urlFormError && <div className="connect-inline-error">{urlFormError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowUrlModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitUrlMutation.loading}>
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
