import { apiGet } from './client';

// params: { page, limit, customerId, status, from, to }
// status enum: PENDING | SENT | DELIVERED | READ | FAILED
export function listMessageLogs(params) {
  return apiGet('/platform/messages/logs', params);
}

// params: { customerId, groupBy: 'day'|'month', from, to }
export function getMessageStats(params) {
  return apiGet('/platform/messages/stats', params);
}

export const MESSAGE_STATUSES = ['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'];
