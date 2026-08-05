import { apiGet, apiPatch } from './client';

// Pricing catalog: Starter / Growth / Scale / Enterprise, each with
// monthly/quarterly/yearly pricing.
export function listPlans() {
  return apiGet('/billing/plans');
}

export function updatePlan(id, payload) {
  return apiPatch(`/billing/platform/plans/${String(id || '').toUpperCase()}`, payload);
}

export function getCustomerPlanHistory(tenantId) {
  return apiGet(`/billing/platform/plans/customer/${tenantId}`);
}

export function getCustomerCurrentPlan(tenantId) {
  return apiGet(`/billing/platform/plans/customer/${tenantId}/current`);
}
