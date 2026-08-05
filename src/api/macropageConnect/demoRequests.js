import { apiGet, apiPatch } from './client';

// params: { page, limit, status }
export function listDemoRequests(params) {
  return apiGet('/demo-requests/platform', params);
}

export function getDemoRequest(id) {
  return apiGet(`/demo-requests/platform/${id}`);
}

// payload: { status: 'PENDING'|'CONTACTED'|'SCHEDULED'|'COMPLETED'|'CANCELLED' }
export function updateDemoRequestStatus(id, payload) {
  return apiPatch(`/demo-requests/platform/${id}`, payload);
}
