import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client';

// GET / returns { success, data: { count, categories[], items[] } } — the
// list needs count/categories alongside items to populate the category
// filter, and those all live under `data`, so the default unwrap is fine.
export function listIntegrationPlatforms({ category, status, search } = {}) {
  return apiGet('/integration-platforms', { category, status, search });
}

// payload: { name, category, status: 'Active'|'Inactive'|'ComingSoon', logoUrl, description, sortOrder }
export function createIntegrationPlatform(payload) {
  return apiPost('/integration-platforms', payload);
}

export function updateIntegrationPlatform(id, payload) {
  return apiPut(`/integration-platforms/${id}`, payload);
}

export function updateIntegrationPlatformStatus(id, status) {
  return apiPatch(`/integration-platforms/${id}/status`, { status });
}

export function deleteIntegrationPlatform(id) {
  return apiDelete(`/integration-platforms/${id}`);
}
