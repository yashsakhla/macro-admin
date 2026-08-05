import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export function listTags() {
  return apiGet('/platform/tags');
}

export function createTag(payload) {
  return apiPost('/platform/tags', payload);
}

export function updateTag(id, payload) {
  return apiPatch(`/platform/tags/${id}`, payload);
}

export function deleteTag(id) {
  return apiDelete(`/platform/tags/${id}`);
}

// payload: { customerId, tagIds: string[] }
export function assignTags(payload) {
  return apiPost('/platform/tags/assign', payload);
}
