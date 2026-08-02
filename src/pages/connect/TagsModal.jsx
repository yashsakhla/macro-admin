import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X, Tag as TagIcon, Check } from 'lucide-react';
import { listTags, createTag, updateTag, deleteTag, assignTags } from '../../api/macropageConnect/tags';
import { useApiQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';
import './connect.css';

// Reusable tag manager. Always supports CRUD on tags. When `customerId` is
// passed (opened from the customer detail view), it also lets the admin
// pick which tags apply to that customer and save the assignment.
export default function TagsModal({ onClose, customerId, initialTagIds = [], onAssigned }) {
  const { data: tags, loading, error, refetch } = useApiQuery(() => listTags(), []);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [selectedIds, setSelectedIds] = useState(initialTagIds);

  const createMutation = useApiMutation(createTag);
  const updateMutation = useApiMutation((id, payload) => updateTag(id, payload));
  const deleteMutation = useApiMutation(deleteTag);
  const assignMutation = useApiMutation(assignTags);

  useEffect(() => {
    setSelectedIds(initialTagIds);
  }, [initialTagIds]);

  const isAssignMode = Boolean(customerId);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Tag name is required.');
      return;
    }
    setFormError('');
    try {
      await createMutation.mutate({ name: name.trim() });
      setName('');
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Could not create tag.');
    }
  }

  function startEdit(tag) {
    setEditingId(tag._id);
    setEditingName(tag.name);
  }

  async function saveEdit(id) {
    if (!editingName.trim()) return;
    await updateMutation.mutate(id, { name: editingName.trim() });
    setEditingId(null);
    refetch();
  }

  async function handleDelete(id) {
    await deleteMutation.mutate(id);
    setSelectedIds((prev) => prev.filter((tagId) => tagId !== id));
    refetch();
  }

  function toggleSelected(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function handleSaveAssignment() {
    await assignMutation.mutate({ customerId, tagIds: selectedIds });
    onAssigned?.(selectedIds);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3>{isAssignMode ? 'Manage customer tags' : 'Manage tags'}</h3>
          <button className="btn-secondary" style={{ padding: 6 }} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input
            className="form-field"
            style={{ flex: 1, margin: 0 }}
            placeholder="New tag name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={createMutation.loading}>
            <Plus size={15} /> Add
          </button>
        </form>
        {formError && <div className="connect-inline-error">{formError}</div>}

        <AsyncState
          loading={loading}
          error={error}
          empty={!loading && !error && (tags?.length ?? 0) === 0}
          emptyIcon={TagIcon}
          emptyTitle="No tags yet"
          emptyMessage="Create a tag above to start grouping customers."
          onRetry={refetch}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
            {(tags || []).map((tag) => (
              <div
                key={tag._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {isAssignMode && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tag._id)}
                    onChange={() => toggleSelected(tag._id)}
                  />
                )}
                {editingId === tag._id ? (
                  <input
                    className="form-field"
                    style={{ flex: 1, margin: 0 }}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: 13.5 }}>{tag.name}</span>
                )}

                {editingId === tag._id ? (
                  <button className="btn-secondary" style={{ padding: 6 }} onClick={() => saveEdit(tag._id)}>
                    <Check size={13} />
                  </button>
                ) : (
                  <button className="btn-secondary" style={{ padding: 6 }} onClick={() => startEdit(tag)}>
                    <Pencil size={13} />
                  </button>
                )}
                <button
                  className="btn-secondary"
                  style={{ padding: 6, color: 'var(--danger)' }}
                  onClick={() => handleDelete(tag._id)}
                  disabled={deleteMutation.loading}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </AsyncState>

        {isAssignMode && (
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSaveAssignment} disabled={assignMutation.loading}>
              {assignMutation.loading ? 'Saving…' : 'Save tags'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
