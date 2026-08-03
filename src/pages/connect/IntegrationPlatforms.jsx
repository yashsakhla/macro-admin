import { useEffect, useMemo, useState } from 'react';
import { Puzzle, Plus, Pencil, Trash2, Search, RefreshCw, X, AlertTriangle } from 'lucide-react';
import {
  listIntegrationPlatforms,
  createIntegrationPlatform,
  updateIntegrationPlatform,
  updateIntegrationPlatformStatus,
  deleteIntegrationPlatform,
} from '../../api/macropageConnect/integrationPlatforms';
import { useApiQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';

// The category dropdown should never be empty on a fresh database — these
// three always show up, merged with whatever distinct categories the list
// endpoint returns.
const DEFAULT_CATEGORIES = ['E-commerce', 'CRM', 'Automation'];

// Wire values are exactly these — PascalCase, no space in ComingSoon. Always
// send STATUS values raw; STATUS_LABELS is only ever for display.
const STATUS_VALUES = ['Active', 'Inactive', 'ComingSoon'];
const STATUS_LABELS = { Active: 'Active', Inactive: 'Inactive', ComingSoon: 'Coming soon' };
const STATUS_BADGE_CLASS = { Active: 'green', Inactive: 'gray', ComingSoon: 'amber' };

const INITIAL_COLORS = ['#6366f1', '#0d9488', '#f59e0b', '#ec4899', '#8b5cf6', '#0ea5e9'];
function initialColor(name) {
  const code = (name || '?').charCodeAt(0) || 0;
  return INITIAL_COLORS[code % INITIAL_COLORS.length];
}

const EMPTY_FORM = { name: '', category: '', status: 'Active', logoUrl: '', description: '', sortOrder: 0 };

export default function ConnectIntegrationPlatforms() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [platforms, setPlatforms] = useState([]);
  const [bannerError, setBannerError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalError, setModalError] = useState('');
  const [categoryMode, setCategoryMode] = useState('select');
  const [newCategoryText, setNewCategoryText] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data: response,
    loading,
    error: queryError,
    refetch,
  } = useApiQuery(
    () => listIntegrationPlatforms({ category: categoryFilter || undefined, status: statusFilter || undefined, search: search || undefined }),
    [categoryFilter, statusFilter, search]
  );

  useEffect(() => {
    setPlatforms(Array.isArray(response?.items) ? response.items : []);
  }, [response]);

  useEffect(() => {
    if (queryError) setBannerError(queryError.message || 'Could not load platforms.');
  }, [queryError]);

  const categories = useMemo(() => {
    const extra = (response?.categories || []).filter((c) => !DEFAULT_CATEGORIES.includes(c));
    return [...DEFAULT_CATEGORIES, ...extra];
  }, [response]);

  const grouped = useMemo(() => {
    const map = new Map();
    platforms.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category).push(p);
    });
    return Array.from(map.entries());
  }, [platforms]);

  const createMutation = useApiMutation(createIntegrationPlatform);
  const updateMutation = useApiMutation((id, payload) => updateIntegrationPlatform(id, payload));
  const statusMutation = useApiMutation((id, status) => updateIntegrationPlatformStatus(id, status));
  const deleteMutation = useApiMutation(deleteIntegrationPlatform);

  function patchForm(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function openCreateModal() {
    setEditingPlatform(null);
    setForm({ ...EMPTY_FORM, category: categories[0] || '' });
    setCategoryMode('select');
    setNewCategoryText('');
    setModalError('');
    setShowModal(true);
  }

  function openEditModal(platform) {
    setEditingPlatform(platform);
    setForm({
      name: platform.name || '',
      category: platform.category || '',
      status: platform.status || 'Active',
      logoUrl: platform.logoUrl || '',
      description: platform.description || '',
      sortOrder: platform.sortOrder ?? 0,
    });
    setCategoryMode('select');
    setNewCategoryText('');
    setModalError('');
    setShowModal(true);
  }

  async function handleStatusChange(platform, status) {
    setPlatforms((list) => list.map((p) => (p._id === platform._id ? { ...p, status } : p)));
    try {
      await statusMutation.mutate(platform._id, status);
    } catch (err) {
      setBannerError(err?.message || 'Could not update status.');
      refetch();
    }
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const category = categoryMode === 'new' ? newCategoryText.trim() : form.category;
    if (!name) {
      setModalError('Platform name is required.');
      return;
    }
    if (!category) {
      setModalError('Category is required.');
      return;
    }
    setModalError('');

    const payload = {
      name,
      category,
      status: form.status,
      logoUrl: form.logoUrl.trim(),
      description: form.description.trim(),
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (editingPlatform) {
        await updateMutation.mutate(editingPlatform._id, payload);
      } else {
        await createMutation.mutate(payload);
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      setModalError(err?.message || 'Could not save platform.');
    }
  }

  async function confirmDelete() {
    try {
      await deleteMutation.mutate(deleteTarget._id);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setBannerError(err?.message || 'Could not delete platform.');
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <div className="connect-page-header">
        <div className="connect-page-header-title">
          <div className="connect-page-header-icon">
            <Puzzle size={18} />
          </div>
          <div>
            <h2>Integration Platforms</h2>
            <p>Manage the third-party platforms shown to customers inside Macropage Connect.</p>
          </div>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Add platform
        </button>
      </div>

      {bannerError && (
        <div className="connect-inline-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} /> {bannerError}
          </span>
          <button
            type="button"
            onClick={() => setBannerError('')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="page-toolbar">
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-500)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 30, maxWidth: 'none', width: '100%' }}
            placeholder="Search platforms by name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <button className="btn-secondary" onClick={refetch} title="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      <AsyncState
        loading={loading}
        loadingLabel="Loading platforms…"
        error={null}
        empty={!loading && grouped.length === 0}
        emptyIcon={Puzzle}
        emptyTitle="No platforms found"
        emptyMessage="Add your first integration platform to get started, or try different filters."
        emptyAction={
          <button className="btn-primary" style={{ marginTop: 6 }} onClick={openCreateModal}>
            <Plus size={15} /> Add platform
          </button>
        }
      >
        {grouped.map(([category, items]) => (
          <div key={category} className="connect-category-group">
            <div className="connect-category-group-heading">
              <h4>{category}</h4>
              <span className="connect-count-pill">{items.length}</span>
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="connect-platform-cell">
                          {p.logoUrl ? (
                            <img className="connect-platform-logo" src={p.logoUrl} alt="" />
                          ) : (
                            <div className="connect-platform-initial" style={{ background: initialColor(p.name) }}>
                              {(p.name || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="cell-primary">{p.name}</div>
                            {p.description && <div className="cell-sub">{p.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`connect-status-select ${STATUS_BADGE_CLASS[p.status] || 'gray'}`}
                          value={p.status}
                          onChange={(e) => handleStatusChange(p, e.target.value)}
                        >
                          {STATUS_VALUES.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="btn-secondary" style={{ padding: 6 }} onClick={() => openEditModal(p)}>
                            <Pencil size={13} />
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: 6, color: 'var(--danger)' }}
                            onClick={() => setDeleteTarget(p)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </AsyncState>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>{editingPlatform ? 'Edit platform' : 'Add platform'}</h3>
              <button type="button" className="btn-secondary" style={{ padding: 6 }} onClick={() => setShowModal(false)}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="form-field">
                <label>Platform name *</label>
                <input
                  value={form.name}
                  onChange={(e) => patchForm({ name: e.target.value })}
                  placeholder="e.g. Shopify"
                  required
                />
              </div>

              <div className="form-field">
                <label>Category *</label>
                <div className="connect-category-select-row">
                  {categoryMode === 'select' ? (
                    <>
                      <select className="connect-input" style={{ flex: 1 }} value={form.category} onChange={(e) => patchForm({ category: e.target.value })}>
                        <option value="">Select category…</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <button type="button" className="btn-secondary" onClick={() => setCategoryMode('new')}>
                        + New
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        className="connect-input"
                        style={{ flex: 1 }}
                        placeholder="New category name"
                        value={newCategoryText}
                        onChange={(e) => setNewCategoryText(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setCategoryMode('select');
                          setNewCategoryText('');
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => patchForm({ status: e.target.value })}>
                  {STATUS_VALUES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Logo URL</label>
                <input
                  value={form.logoUrl}
                  onChange={(e) => patchForm({ logoUrl: e.target.value })}
                  placeholder="https://…"
                />
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => patchForm({ description: e.target.value })}
                  placeholder="Short description shown under the platform name"
                />
              </div>

              <div className="form-field">
                <label>Sort order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => patchForm({ sortOrder: e.target.value })}
                />
              </div>

              {modalError && <div className="connect-inline-error">{modalError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.loading || updateMutation.loading}>
                  {createMutation.loading || updateMutation.loading
                    ? 'Saving...'
                    : editingPlatform
                    ? 'Save changes'
                    : 'Add platform'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal-panel" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>Delete platform?</h3>
              <button type="button" className="btn-secondary" style={{ padding: 6 }} onClick={() => setDeleteTarget(null)}>
                <X size={14} />
              </button>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-700)', marginBottom: 20 }}>
              This removes <strong>{deleteTarget.name}</strong> from the admin portal and from Macropage Connect. This can&apos;t be undone.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: 'var(--danger)' }}
                disabled={deleteMutation.loading}
                onClick={confirmDelete}
              >
                {deleteMutation.loading ? 'Deleting...' : 'Delete platform'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
