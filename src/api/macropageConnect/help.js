import { apiGet, apiPost, apiPatch, apiDelete } from './client';

// This is the real, live self-serve help center — creates/edits here publish
// immediately to the product, so treat every write as a real change.

// Docs — content is Markdown.
// params: { category? }
export function listHelpDocs(params) {
  return apiGet('/help/docs', params);
}

export function getHelpDoc(id) {
  return apiGet(`/help/docs/${id}`);
}

// payload: { title, slug, category, order?, tags?: string[], content }
export function createHelpDoc(payload) {
  return apiPost('/help/docs', payload);
}

export function updateHelpDoc(id, payload) {
  return apiPatch(`/help/docs/${id}`, payload);
}

export function deleteHelpDoc(id) {
  return apiDelete(`/help/docs/${id}`);
}

// FAQs
// params: { category? }
export function listHelpFaqs(params) {
  return apiGet('/help/faqs', params);
}

export function getHelpFaq(id) {
  return apiGet(`/help/faqs/${id}`);
}

// payload: { category, order?, question, answer, tags?: string[] }
export function createHelpFaq(payload) {
  return apiPost('/help/faqs', payload);
}

export function updateHelpFaq(id, payload) {
  return apiPatch(`/help/faqs/${id}`, payload);
}

export function deleteHelpFaq(id) {
  return apiDelete(`/help/faqs/${id}`);
}
