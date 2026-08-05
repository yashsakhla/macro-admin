import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export function listTemplates() {
  return apiGet('/sample-templates/platform');
}

export function getTemplate(id) {
  return apiGet(`/sample-templates/platform/${id}`);
}

// payload: {
//   name, category: 'MARKETING'|'UTILITY'|'AUTHENTICATION', language, body,
//   header?: { format: 'TEXT', text }, footer?: string,
//   buttons?: { buttons: [{ type: 'QUICK_REPLY', text } | { type: 'URL', text, url } | { type: 'PHONE_NUMBER', text, phone_number }] },
//   sampleVariables: { [n]: string }, variableTypes: { [n]: string },
// }
export function createTemplate(payload) {
  return apiPost('/sample-templates/platform', payload);
}

export function updateTemplate(id, payload) {
  return apiPatch(`/sample-templates/platform/${id}`, payload);
}

export function deleteTemplate(id) {
  return apiDelete(`/sample-templates/platform/${id}`);
}
