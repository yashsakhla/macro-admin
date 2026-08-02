import { apiGet, apiPost } from './client';

export function listNotifications() {
  return apiGet('/notifications');
}

// payload: { title, body, channel: 'in_app'|'whatsapp' }
export function broadcastNotification(payload) {
  return apiPost('/notifications/broadcast', payload);
}

// payload: { title, body, channel, targetType: 'tag'|'customer', targetIds }
export function sendNotification(payload) {
  return apiPost('/notifications/send', payload);
}
