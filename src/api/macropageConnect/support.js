import { apiGet, apiPost, apiPatch, apiDelete } from './client';

// params: { page, limit, status, priority, customerId, assignedTo }
export function listTickets(params) {
  return apiGet('/help/tickets/platform', params);
}

export function getTicket(id) {
  return apiGet(`/help/tickets/platform/${id}`);
}

// payload: { customerId, subject, description?, status?, priority?, assignedTo? }
export function createTicket(payload) {
  return apiPost('/help/tickets/platform', payload);
}

export function updateTicket(id, payload) {
  return apiPatch(`/help/tickets/platform/${id}`, payload);
}

export function deleteTicket(id) {
  return apiDelete(`/help/tickets/platform/${id}`);
}
