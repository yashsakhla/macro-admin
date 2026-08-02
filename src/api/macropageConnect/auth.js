import { apiPost } from './client';

// Shared across products: this is the one login for Mr Fuels Transact and
// Macropage Connect alike. It intentionally stays at /auth/login and must
// never move under the /macropage-connect prefix (client.js's resolvePath
// carves this path out specifically for that reason).
export function login(email, password) {
  return apiPost('/auth/login', { email, password });
}
