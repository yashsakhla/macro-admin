import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export function listTemplates() {
  return apiGet('/templates');
}

export function getTemplate(id) {
  return apiGet(`/templates/${id}`);
}

// payload: {
//   name, category: 'MARKETING'|'UTILITY'|'AUTHENTICATION', language, body,
//   header?: { format: 'TEXT', text }, footer?: string,
//   buttons?: { buttons: [{ type: 'QUICK_REPLY', text } | { type: 'URL', text, url } | { type: 'PHONE_NUMBER', text, phone_number }] },
//   sampleVariables: { [n]: string }, variableTypes: { [n]: string },
// }
export function createTemplate(payload) {
  return apiPost('/templates', payload);
}

export function updateTemplate(id, payload) {
  return apiPatch(`/templates/${id}`, payload);
}

export function deleteTemplate(id) {
  return apiDelete(`/templates/${id}`);
}
