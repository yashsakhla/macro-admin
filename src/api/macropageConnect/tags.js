import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export function listTags() {
  return apiGet('/tags');
}

export function createTag(payload) {
  return apiPost('/tags', payload);
}

export function updateTag(id, payload) {
  return apiPatch(`/tags/${id}`, payload);
}

export function deleteTag(id) {
  return apiDelete(`/tags/${id}`);
}

// payload: { customerId, tagIds: string[] }
export function assignTags(payload) {
  return apiPost('/tags/assign', payload);
}
