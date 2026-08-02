import { apiGet } from './client';

export function getDashboardStats() {
  return apiGet('/stats/dashboard');
}
