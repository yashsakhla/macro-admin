import { apiGet } from './client';

export function getDashboardStats() {
  return apiGet('/platform/customers/dashboard-stats');
}
