import { apiGet, apiPatch } from './client';

// Pricing catalog: Starter / Growth / Scale / Enterprise, each with
// monthly/quarterly/yearly pricing.
export function listPlans() {
  return apiGet('/plans');
}

export function updatePlan(id, payload) {
  return apiPatch(`/plans/${String(id || '').toUpperCase()}`, payload);
}

export function getCustomerPlanHistory(tenantId) {
  return apiGet(`/plans/customer/${tenantId}`);
}

export function getCustomerCurrentPlan(tenantId) {
  return apiGet(`/plans/customer/${tenantId}/current`);
}
