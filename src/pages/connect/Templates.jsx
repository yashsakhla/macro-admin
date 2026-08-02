import { useMemo, useRef, useState } from 'react';
import {
  FileText,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Megaphone,
  Package,
  ShieldCheck,
  Bold,
  Italic,
  Strikethrough,
  Tag,
  Plus,
} from 'lucide-react';
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../../api/macropageConnect/templates';
import { useApiQuery, useApiMutation } from '../../api/macropageConnect/hooks';
import AsyncState from './components/AsyncState';

const CATEGORY_OPTIONS = [
  { value: 'MARKETING', label: 'Marketing', desc: 'Promos, offers & announcements', icon: Megaphone, color: '#4f46e5', badge: 'blue' },
  { value: 'UTILITY', label: 'Utility', desc: 'Order & account updates', icon: Package, color: '#16a34a', badge: 'green' },
  { value: 'AUTHENTICATION', label: 'Authentication', desc: 'OTPs & verification codes', icon: ShieldCheck, color: '#d97706', badge: 'amber' },
];

const LANGUAGES = [
  { code: 'en_US', label: 'English (US)' },
  { code: 'en_GB', label: 'English (UK)' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'kn', label: 'Kannada' },
  { code: 'bn', label: 'Bengali' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ur', label: 'Urdu' },
  { code: 'es', label: 'Spanish' },
  { code: 'es_MX', label: 'Spanish (Mexico)' },
  { code: 'pt_BR', label: 'Portuguese (Brazil)' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ar', label: 'Arabic' },
  { code: 'id', label: 'Indonesian' },
  { code: 'zh_CN', label: 'Chinese (Simplified)' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ru', label: 'Russian' },
  { code: 'it', label: 'Italian' },
];

const VARIABLE_TYPE_OPTIONS = [
  { value: 'text', label: 'Generic text' },
  { value: 'contactName', label: 'Contact name' },
  { value: 'phoneNumber', label: 'Phone number' },
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'orderNumber', label: 'Order number' },
];

const FORMAT_MARKS = [
  { wrap: '*', label: 'Bold', icon: Bold },
  { wrap: '_', label: 'Italic', icon: Italic },
  { wrap: '~', label: 'Strike', icon: Strikethrough },
];

const EMPTY_FORM = {
  name: '',
  category: 'MARKETING',
  language: 'en_US',
  body: '',
  hasHeader: false,
  headerText: '',
  hasFooter: false,
  footerText: '',
  hasButtons: false,
  buttonType: 'QUICK_REPLY',
  quickReplies: [],
  ctaButtons: [],
  sampleVariables: {},
  variableTypes: {},
};

// WhatsApp templates use positional placeholders ({{1}}, {{2}}, ...) rather
// than named ones — Meta requires a sample value per number for review.
function detectVariables(body) {
  const found = new Set();
  const re = /\{\{(\d+)\}\}/g;
  let m;
  while ((m = re.exec(body || ''))) found.add(m[1]);
  return Array.from(found).sort((a, b) => Number(a) - Number(b));
}

function renderPreview(body, sampleVariables) {
  if (!body) return '';
  return body.replace(/\{\{(\d+)\}\}/g, (match, n) => (sampleVariables[n] ? sampleVariables[n] : `[${n}]`));
}

function charCountClass(len, max) {
  if (len > max) return 'connect-char-count danger';
  if (len > max * 0.85) return 'connect-char-count warn';
  return 'connect-char-count';
}

export default function ConnectTemplates() {
  const { data: templates, loading, error, refetch } = useApiQuery(() => listTemplates(), []);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [showVarErrors, setShowVarErrors] = useState(false);
  const bodyRef = useRef(null);

  const createMutation = useApiMutation(createTemplate);
  const updateMutation = useApiMutation((id, payload) => updateTemplate(id, payload));
  const deleteMutation = useApiMutation(deleteTemplate);

  const detectedVars = useMemo(() => detectVariables(form.body), [form.body]);
  const preview = useMemo(() => renderPreview(form.body, form.sampleVariables), [form.body, form.sampleVariables]);

  function patchForm(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowVarErrors(false);
    setShowModal(true);
  }

  function openEdit(tpl) {
    setEditingId(tpl.id);
    const buttons = tpl.buttons?.buttons || [];
    setForm({
      name: tpl.name || '',
      category: tpl.category || 'MARKETING',
      language: tpl.language || 'en_US',
      body: tpl.body || '',
      hasHeader: Boolean(tpl.header?.text),
      headerText: tpl.header?.text || '',
      hasFooter: Boolean(tpl.footer),
      footerText: tpl.footer || '',
      hasButtons: buttons.length > 0,
      buttonType: buttons[0]?.type === 'QUICK_REPLY' ? 'QUICK_REPLY' : 'CTA',
      quickReplies: buttons.filter((b) => b.type === 'QUICK_REPLY').map((b) => ({ text: b.text || '' })),
      ctaButtons: buttons
        .filter((b) => b.type !== 'QUICK_REPLY')
        .map((b) => ({ type: b.type || 'URL', text: b.text || '', value: b.url || b.phone_number || '' })),
      sampleVariables: { ...(tpl.sampleVariables || {}) },
      variableTypes: { ...(tpl.variableTypes || {}) },
    });
    setFormError('');
    setShowVarErrors(false);
    setShowModal(true);
  }

  function insertAtCursor(before, after = before) {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? form.body.length;
    const end = el.selectionEnd ?? form.body.length;
    const selected = form.body.slice(start, end);
    const next = `${form.body.slice(0, start)}${before}${selected}${after}${form.body.slice(end)}`;
    patchForm({ body: next });
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + before.length + selected.length + after.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  function insertVariable() {
    const existing = detectVariables(form.body).map(Number);
    const next = existing.length ? Math.max(...existing) + 1 : 1;
    insertAtCursor(`{{${next}}}`, '');
  }

  function setSampleVariable(n, value) {
    patchForm({ sampleVariables: { ...form.sampleVariables, [n]: value } });
  }

  function setVariableType(n, value) {
    patchForm({ variableTypes: { ...form.variableTypes, [n]: value } });
  }

  function addQuickReply() {
    if (form.quickReplies.length >= 3) return;
    patchForm({ quickReplies: [...form.quickReplies, { text: '' }] });
  }
  function updateQuickReply(i, text) {
    const next = form.quickReplies.slice();
    next[i] = { text };
    patchForm({ quickReplies: next });
  }
  function removeQuickReply(i) {
    patchForm({ quickReplies: form.quickReplies.filter((_, idx) => idx !== i) });
  }

  function addCtaButton() {
    if (form.ctaButtons.length >= 2) return;
    patchForm({ ctaButtons: [...form.ctaButtons, { type: 'URL', text: '', value: '' }] });
  }
  function updateCtaButton(i, patch) {
    const next = form.ctaButtons.slice();
    next[i] = { ...next[i], ...patch };
    patchForm({ ctaButtons: next });
  }
  function removeCtaButton(i) {
    patchForm({ ctaButtons: form.ctaButtons.filter((_, idx) => idx !== i) });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.category || !form.body.trim()) {
      setFormError('Name, category and body are required.');
      return;
    }
    const missingSample = detectedVars.some((n) => !(form.sampleVariables[n] || '').trim());
    if (missingSample) {
      setShowVarErrors(true);
      setFormError('Every variable needs a sample value before this can be submitted.');
      return;
    }

    const sampleVariables = {};
    const variableTypes = {};
    detectedVars.forEach((n) => {
      if ((form.sampleVariables[n] || '').trim()) sampleVariables[n] = form.sampleVariables[n].trim();
      if (form.variableTypes[n]) variableTypes[n] = form.variableTypes[n];
    });

    const payload = {
      name: form.name.trim(),
      category: form.category,
      language: form.language,
      body: form.body.trim(),
      header: form.hasHeader && form.headerText.trim() ? { format: 'TEXT', text: form.headerText.trim() } : undefined,
      footer: form.hasFooter && form.footerText.trim() ? form.footerText.trim() : undefined,
      buttons: form.hasButtons
        ? {
            buttons:
              form.buttonType === 'QUICK_REPLY'
                ? form.quickReplies.filter((b) => b.text.trim()).map((b) => ({ type: 'QUICK_REPLY', text: b.text.trim() }))
                : form.ctaButtons
                    .filter((b) => b.text.trim() && b.value.trim())
                    .map((b) =>
                      b.type === 'URL'
                        ? { type: 'URL', text: b.text.trim(), url: b.value.trim() }
                        : { type: 'PHONE_NUMBER', text: b.text.trim(), phone_number: b.value.trim() }
                    ),
          }
        : undefined,
      sampleVariables,
      variableTypes,
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
      setFormError(err?.message || 'Could not save template.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this template?')) return;
    await deleteMutation.mutate(id);
    refetch();
  }

  const bodyLen = (form.body || '').length;
  const footerLen = (form.footerText || '').length;
  const headerLen = (form.headerText || '').length;
  const categoryMeta = CATEGORY_OPTIONS.find((c) => c.value === form.category);

  return (
    <div>
      <div className="page-toolbar">
        <span className="table-toolbar-count">{templates?.length ?? 0} templates</span>
        <button className="btn-primary" onClick={openCreate}>
          <PlusCircle size={16} /> New template
        </button>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && (templates?.length ?? 0) === 0}
        emptyIcon={FileText}
        emptyTitle="No templates yet"
        emptyMessage="Create a template to reuse across notifications."
        onRetry={refetch}
      >
        <div style={{ display: 'grid', gap: 14 }}>
          {(templates || []).map((tpl) => {
            const cat = CATEGORY_OPTIONS.find((c) => c.value === tpl.category);
            return (
              <div key={tpl.id} className="template-card">
                <div className="detail-row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div className="cell-primary">{tpl.name}</div>
                    <div className="cell-sub">{tpl.language}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {cat && <span className={`badge ${cat.badge}`}>{cat.label}</span>}
                    <button className="btn-secondary" style={{ padding: 6 }} onClick={() => openEdit(tpl)}>
                      <Pencil size={13} />
                    </button>
                    <button className="btn-secondary" style={{ padding: 6, color: 'var(--danger)' }} onClick={() => handleDelete(tpl.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p style={{ marginTop: 10, color: '#475569', whiteSpace: 'pre-wrap' }}>{tpl.body}</p>
              </div>
            );
          })}
        </div>
      </AsyncState>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel connect-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="connect-modal-header">
              <h3>{editingId ? 'Edit template' : 'Create template'}</h3>
              <button type="button" className="connect-modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form id="template-form" onSubmit={handleSubmit} className="connect-modal-body">
              {/* LEFT — form */}
              <div className="connect-modal-form">
                <div className="connect-section-card">
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label>Template name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => patchForm({ name: e.target.value })}
                      placeholder="e.g. order_confirmation"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 8 }}>
                      Category *
                    </label>
                    <div className="connect-category-grid">
                      {CATEGORY_OPTIONS.map((cat) => {
                        const Icon = cat.icon;
                        const selected = form.category === cat.value;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => patchForm({ category: cat.value })}
                            className={`connect-category-card${selected ? ' selected' : ''}`}
                          >
                            <div className="connect-category-icon" style={{ background: cat.color }}>
                              <Icon size={14} />
                            </div>
                            <p className="cat-label">{cat.label}</p>
                            <p className="cat-desc">{cat.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 8 }}>
                      Language
                    </label>
                    <select className="connect-input" value={form.language} onChange={(e) => patchForm({ language: e.target.value })}>
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label} ({l.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="connect-section-card">
                  {/* header */}
                  <div>
                    <div className="connect-toggle-row">
                      <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)' }}>Header (optional)</label>
                      <button
                        type="button"
                        className={`connect-toggle${form.hasHeader ? ' on' : ''}`}
                        onClick={() => patchForm({ hasHeader: !form.hasHeader })}
                      >
                        <span className="connect-toggle-dot" />
                      </button>
                    </div>
                    {form.hasHeader && (
                      <div style={{ marginTop: 10 }}>
                        <input
                          className="connect-input"
                          value={form.headerText}
                          onChange={(e) => patchForm({ headerText: e.target.value })}
                          placeholder="Header text (max 60 chars)"
                          maxLength={60}
                        />
                        <p className={charCountClass(headerLen, 60)}>{headerLen}/60</p>
                      </div>
                    )}
                  </div>

                  {/* body */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 8 }}>
                      Message body *
                    </label>
                    <div className="connect-format-row">
                      {FORMAT_MARKS.map(({ wrap, label, icon: Icon }) => (
                        <button key={label} type="button" className="connect-format-btn" onClick={() => insertAtCursor(wrap)}>
                          <Icon size={12} /> {label}
                        </button>
                      ))}
                      <button type="button" className="connect-format-btn connect-var-btn" onClick={insertVariable}>
                        <Tag size={12} /> Add variable
                      </button>
                    </div>
                    <textarea
                      className="connect-input"
                      ref={bodyRef}
                      value={form.body}
                      onChange={(e) => patchForm({ body: e.target.value })}
                      placeholder="Hi {{1}}, your order is confirmed."
                      rows={5}
                      maxLength={1024}
                      required
                      style={{ marginTop: 8 }}
                    />
                    <p className={charCountClass(bodyLen, 1024)}>{bodyLen}/1024</p>

                    {detectedVars.length > 0 && (
                      <div className="connect-var-panel">
                        <p className="connect-var-panel-title">Variable type &amp; sample value (shown to Meta during review)</p>
                        {detectedVars.map((n) => {
                          const isMissing = showVarErrors && !(form.sampleVariables[n] || '').trim();
                          return (
                            <div key={n}>
                              <div className="connect-var-row">
                                <span className="connect-var-tag">{`{{${n}}}`}</span>
                                <select
                                  className="connect-input"
                                  style={{ width: 150, flexShrink: 0 }}
                                  value={form.variableTypes[n] || ''}
                                  onChange={(e) => setVariableType(n, e.target.value)}
                                >
                                  <option value="">Variable type…</option>
                                  {VARIABLE_TYPE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                      {o.label}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  className="connect-input"
                                  style={{ flex: 1, borderColor: isMissing ? 'var(--danger)' : undefined }}
                                  placeholder={`Sample value for {{${n}}} *`}
                                  value={form.sampleVariables[n] || ''}
                                  onChange={(e) => setSampleVariable(n, e.target.value)}
                                />
                              </div>
                              {isMissing && (
                                <p style={{ fontSize: 10.5, color: 'var(--danger)', marginTop: 4, marginLeft: 48 }}>
                                  Sample value is required
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* footer */}
                  <div>
                    <div className="connect-toggle-row">
                      <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)' }}>Footer (optional)</label>
                      <button
                        type="button"
                        className={`connect-toggle${form.hasFooter ? ' on' : ''}`}
                        onClick={() => patchForm({ hasFooter: !form.hasFooter })}
                      >
                        <span className="connect-toggle-dot" />
                      </button>
                    </div>
                    {form.hasFooter && (
                      <div style={{ marginTop: 10 }}>
                        <input
                          className="connect-input"
                          value={form.footerText}
                          onChange={(e) => patchForm({ footerText: e.target.value })}
                          placeholder="Opt-out message or disclaimer"
                          maxLength={60}
                        />
                        <p className={charCountClass(footerLen, 60)}>{footerLen}/60</p>
                      </div>
                    )}
                  </div>

                  {/* buttons */}
                  <div>
                    <div className="connect-toggle-row">
                      <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)' }}>Buttons (optional)</label>
                      <button
                        type="button"
                        className={`connect-toggle${form.hasButtons ? ' on' : ''}`}
                        onClick={() => patchForm({ hasButtons: !form.hasButtons })}
                      >
                        <span className="connect-toggle-dot" />
                      </button>
                    </div>
                    {form.hasButtons && (
                      <div style={{ marginTop: 10 }}>
                        <div className="connect-type-row" style={{ marginBottom: 10 }}>
                          {[
                            ['QUICK_REPLY', 'Quick replies'],
                            ['CTA', 'Call to action'],
                          ].map(([val, label]) => (
                            <button
                              key={val}
                              type="button"
                              className={`connect-type-btn${form.buttonType === val ? ' selected' : ''}`}
                              onClick={() => patchForm({ buttonType: val })}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        {form.buttonType === 'QUICK_REPLY' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {form.quickReplies.map((btn, i) => (
                              <div key={i} className="connect-btn-row">
                                <input
                                  className="connect-input"
                                  value={btn.text}
                                  onChange={(e) => updateQuickReply(i, e.target.value)}
                                  placeholder="Button text (max 20 chars)"
                                  maxLength={20}
                                  style={{ flex: 1 }}
                                />
                                <button type="button" className="connect-remove-btn" onClick={() => removeQuickReply(i)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            {form.quickReplies.length < 3 && (
                              <button type="button" className="connect-add-btn" onClick={addQuickReply}>
                                <Plus size={12} /> Add button
                              </button>
                            )}
                          </div>
                        )}

                        {form.buttonType === 'CTA' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {form.ctaButtons.map((btn, i) => (
                              <div key={i} className="connect-section-card" style={{ padding: 10, gap: 8 }}>
                                <div className="connect-btn-row">
                                  <select
                                    className="connect-input"
                                    value={btn.type}
                                    onChange={(e) => updateCtaButton(i, { type: e.target.value })}
                                    style={{ width: 150 }}
                                  >
                                    <option value="URL">Visit website</option>
                                    <option value="PHONE_NUMBER">Call phone</option>
                                  </select>
                                  <input
                                    className="connect-input"
                                    value={btn.text}
                                    onChange={(e) => updateCtaButton(i, { text: e.target.value })}
                                    placeholder="Button text"
                                    maxLength={20}
                                    style={{ flex: 1 }}
                                  />
                                  <button type="button" className="connect-remove-btn" onClick={() => removeCtaButton(i)}>
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <input
                                  className="connect-input"
                                  value={btn.value}
                                  onChange={(e) => updateCtaButton(i, { value: e.target.value })}
                                  placeholder={btn.type === 'URL' ? 'https://...' : '+91 XXXXXXXXXX'}
                                />
                              </div>
                            ))}
                            {form.ctaButtons.length < 2 && (
                              <button type="button" className="connect-add-btn" onClick={addCtaButton}>
                                <Plus size={12} /> Add button
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {formError && <div className="connect-inline-error">{formError}</div>}
              </div>

              {/* RIGHT — live preview */}
              <div className="connect-modal-side">
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-700)' }}>Live preview</p>
                <div className="popup-preview">
                  {form.hasHeader && form.headerText && <div className="popup-header">{form.headerText}</div>}
                  <div className="popup-body">{preview || 'Your message will appear here.'}</div>
                  {form.hasFooter && form.footerText && (
                    <div className="popup-footer" style={{ color: 'var(--ink-500)', fontSize: 12 }}>{form.footerText}</div>
                  )}
                  {form.hasButtons && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                      {(form.buttonType === 'QUICK_REPLY' ? form.quickReplies : form.ctaButtons).map((b, i) => (
                        <div key={i} style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--accent)' }}>
                          {b.text || `Button ${i + 1}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {categoryMeta && <span className={`badge ${categoryMeta.badge}`} style={{ alignSelf: 'flex-start' }}>{categoryMeta.label}</span>}
              </div>
            </form>

            <div className="connect-modal-footer">
              <p style={{ fontSize: 11.5, color: 'var(--ink-500)', margin: 0 }}>Meta approval typically takes 24–48 hours</p>
              <div className="modal-actions" style={{ margin: 0 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  form="template-form"
                  className="btn-primary"
                  disabled={createMutation.loading || updateMutation.loading}
                >
                  {createMutation.loading || updateMutation.loading
                    ? 'Submitting...'
                    : editingId
                    ? 'Save changes'
                    : 'Submit for review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
