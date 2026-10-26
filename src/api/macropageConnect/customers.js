import { apiGet, apiPost } from './client';

// params: { page, limit, search, billingPlan, tagId }
export function listCustomers(params) {
  return apiGet('/platform/customers', params);
}

export function getCustomer(id) {
  return apiGet(`/platform/customers/${id}`);
}

export function getCustomerProfile(id) {
  return apiGet(`/platform/customers/${id}/profile`);
}

// --- Account & subscription management (admin) ---

// payload: { planId, billingCycle: 'monthly'|'quarterly'|'yearly', startDate?, amountPaid?, paymentMode?, note? }
export function createCustomerSubscription(id, payload) {
  return apiPost(`/platform/customers/${id}/subscription`, payload);
}

// payload: { months?: number, days?: number, reason? } — at least one of months/days
export function extendCustomerSubscription(id, payload) {
  return apiPost(`/platform/customers/${id}/subscription/extend`, payload);
}

// payload: { reason }
export function suspendCustomer(id, payload) {
  return apiPost(`/platform/customers/${id}/suspend`, payload);
}

export function unsuspendCustomer(id) {
  return apiPost(`/platform/customers/${id}/unsuspend`, {});
}

// payload: { reason, confirmEmail } — backend verifies confirmEmail matches the customer.
export function deleteCustomer(id, payload) {
  return apiPost(`/platform/customers/${id}/delete`, payload);
}
