import { apiGet, apiPost, apiPatch, apiDelete } from './client';

// GET / returns { success, data: { count, categories[], items[] } } — the
// list needs count/categories alongside items to populate the category
// filter, and those all live under `data`, so the default unwrap is fine.
export function listIntegrationPlatforms({ category, status, search } = {}) {
  return apiGet('/integration-platforms/platform', { category, status, search });
}

export function getIntegrationPlatform(id) {
  return apiGet(`/integration-platforms/platform/${id}`);
}

// payload: { name, category, status: 'Active'|'Inactive'|'ComingSoon', logoUrl, description, sortOrder }
export function createIntegrationPlatform(payload) {
  return apiPost('/integration-platforms/platform', payload);
}

// Method changed PUT -> PATCH to match the new API's convention.
export function updateIntegrationPlatform(id, payload) {
  return apiPatch(`/integration-platforms/platform/${id}`, payload);
}

export function updateIntegrationPlatformStatus(id, status) {
  return apiPatch(`/integration-platforms/platform/${id}/status`, { status });
}

export function deleteIntegrationPlatform(id) {
  return apiDelete(`/integration-platforms/platform/${id}`);
}
