import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client';

// GET / returns { success, count, categories[], data[] } — the list needs
// the whole envelope (not just `data`) to populate the category filter, so
// this one call opts into the raw response shape.
export function listIntegrationPlatforms({ category, status, search } = {}) {
  return apiGet('/admin/integration-platforms', { category, status, search }, { raw: true });
}

// payload: { name, category, status: 'Active'|'Inactive'|'ComingSoon', logoUrl, description, sortOrder }
export function createIntegrationPlatform(payload) {
  return apiPost('/admin/integration-platforms', payload);
}

export function updateIntegrationPlatform(id, payload) {
  return apiPut(`/admin/integration-platforms/${id}`, payload);
}

export function updateIntegrationPlatformStatus(id, status) {
  return apiPatch(`/admin/integration-platforms/${id}/status`, { status });
}

export function deleteIntegrationPlatform(id) {
  return apiDelete(`/admin/integration-platforms/${id}`);
}
