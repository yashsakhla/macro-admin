import { apiGet } from './client';

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
