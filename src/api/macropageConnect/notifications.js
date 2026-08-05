import { apiGet, apiPost } from './client';

export function listNotifications() {
  return apiGet('/platform/notifications');
}

// payload: { title, body, channel: 'in_app'|'whatsapp' }
export function broadcastNotification(payload) {
  return apiPost('/platform/notifications/broadcast', payload);
}

// payload: { title, body, channel, targetType: 'tag'|'customer', targetIds }
export function sendNotification(payload) {
  return apiPost('/platform/notifications/send', payload);
}
