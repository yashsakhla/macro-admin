import { apiGet } from './client';

// params: { page, limit, search, billingPlan, tagId }
export function listCustomers(params) {
  return apiGet('/customers', params);
}

export function getCustomer(id) {
  return apiGet(`/customers/${id}`);
}

export function getCustomerProfile(id) {
  return apiGet(`/customers/${id}/profile`);
}
