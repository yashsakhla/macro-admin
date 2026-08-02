import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export function listAds() {
  return apiGet('/ads');
}

export function listActiveAds(customerId) {
  return apiGet('/ads/active', customerId ? { customerId } : undefined);
}

// payload: { title, description, mediaUrl, category: 'Alert'|'Notification'|'Invitation'|'Ads'|'Greeting', type: 'popup', targetType?, targetIds?, isActive?, startDate?, endDate?, priority? }
export function createAd(payload) {
  return apiPost('/ads', payload);
}

export function updateAd(id, payload) {
  return apiPatch(`/ads/${id}`, payload);
}

export function deleteAd(id) {
  return apiDelete(`/ads/${id}`);
}
