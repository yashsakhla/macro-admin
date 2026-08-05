import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export function listAds() {
  return apiGet('/ads/platform');
}

export function listActiveAds(customerId) {
  return apiGet('/ads/platform/active', customerId ? { customerId } : undefined);
}

export function getAd(id) {
  return apiGet(`/ads/platform/${id}`);
}

// payload: { title, description, mediaUrl, category: 'Alert'|'Notification'|'Invitation'|'Ads'|'Greeting', type: 'popup', targetType?, targetIds?, isActive?, startDate?, endDate?, priority? }
export function createAd(payload) {
  return apiPost('/ads/platform', payload);
}

export function updateAd(id, payload) {
  return apiPatch(`/ads/platform/${id}`, payload);
}

export function deleteAd(id) {
  return apiDelete(`/ads/platform/${id}`);
}
