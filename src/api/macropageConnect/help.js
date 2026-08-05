import { apiGet, apiPost, apiPatch, apiDelete } from './client';

// This is the real, live self-serve help center — creates/edits here publish
// immediately to the product, so treat every write as a real change.

// Docs — content is Markdown.
// params: { category? }
export function listHelpDocs(params) {
  return apiGet('/help/docs', params);
}

// NOT PORTED on the new API — the list endpoint already returns full content,
// so this has no backing route on macropage-connect. Kept unused.
export function getHelpDoc(id) {
  return apiGet(`/help/docs/${id}`);
}

// payload: { title, slug, category, order?, tags?: string[], content }
export function createHelpDoc(payload) {
  return apiPost('/help/platform/docs', payload);
}

export function updateHelpDoc(id, payload) {
  return apiPatch(`/help/platform/docs/${id}`, payload);
}

export function deleteHelpDoc(id) {
  return apiDelete(`/help/platform/docs/${id}`);
}

// FAQs
// params: { category? }
export function listHelpFaqs(params) {
  return apiGet('/help/faq', params);
}

// NOT PORTED on the new API — the list endpoint already returns full content,
// so this has no backing route on macropage-connect. Kept unused.
export function getHelpFaq(id) {
  return apiGet(`/help/faq/${id}`);
}

// payload: { category, order?, question, answer, tags?: string[] }
export function createHelpFaq(payload) {
  return apiPost('/help/platform/faq', payload);
}

export function updateHelpFaq(id, payload) {
  return apiPatch(`/help/platform/faq/${id}`, payload);
}

export function deleteHelpFaq(id) {
  return apiDelete(`/help/platform/faq/${id}`);
}
