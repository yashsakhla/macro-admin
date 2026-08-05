import { apiGet, apiPost, apiPatch, apiDelete } from './client';

// Tutorial videos shown in the live product — YouTube links with a title and
// display order.

export function listVideos() {
  return apiGet('/help/videos');
}

export function getVideo(id) {
  return apiGet(`/help/platform/video-tutorials/${id}`);
}

// payload: { url, title, order? }
export function createVideo(payload) {
  return apiPost('/help/platform/video-tutorials', payload);
}

export function updateVideo(id, payload) {
  return apiPatch(`/help/platform/video-tutorials/${id}`, payload);
}

export function deleteVideo(id) {
  return apiDelete(`/help/platform/video-tutorials/${id}`);
}
