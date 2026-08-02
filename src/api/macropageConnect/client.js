// Small fetch wrapper for the Macropage Connect API.
// Unwraps the { success, data } envelope, normalizes errors, and attaches
// the Connect-scoped JWT to every request.

import { getToken, clearSession } from './session';
import { STORAGE_KEY as PORTAL_SESSION_KEY } from '../../context/AuthContext';

const BASE_URL = import.meta.env.VITE_MACROPAGE_CONNECT_API_URL || 'https://macropage-admin.onrender.com/api';

// Every Macropage Connect route lives under this prefix. Two kinds of paths
// are carved out and left as-is: POST /auth/login (shared with Mr Fuels
// Transact) and anything already under /admin (portal-wide admin endpoints,
// e.g. Integration Platforms, that sit outside the per-product API).
const PRODUCT_PREFIX = '/macropage-connect';

export function resolvePath(path) {
  if (path === '/auth/login' || path.startsWith('/admin/')) return path;
  return `${PRODUCT_PREFIX}${path}`;
}

export function buildQuery(params) {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    usp.set(key, value);
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export function handleUnauthorized() {
  // There's only one login for the whole portal — an expired/invalid Connect
  // token means the session is no longer valid at all, so clear both and
  // send the user back to the start.
  clearSession();
  localStorage.removeItem(PORTAL_SESSION_KEY);
  window.location.href = '/login';
}

async function request(path, { method = 'GET', body, params, raw = false } = {}) {
  const resolvedPath = resolvePath(path);
  const url = `${BASE_URL}${resolvedPath}${buildQuery(params)}`;
  const token = getToken();

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw { statusCode: 0, message: 'Could not reach the server. Check your connection.', path: resolvedPath };
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // No JSON body (e.g. empty 204 response) — treat as success with no data.
  }

  if (response.status === 401) {
    handleUnauthorized();
    throw { statusCode: 401, message: payload?.message || 'Session expired.', path: resolvedPath };
  }

  if (!response.ok || payload?.success === false) {
    throw {
      statusCode: payload?.statusCode ?? response.status,
      message: payload?.message || 'Something went wrong. Please try again.',
      path: payload?.path ?? resolvedPath,
    };
  }

  // Most endpoints wrap the payload as { success, data }. A few (e.g.
  // Integration Platforms' list route) return extra top-level fields
  // (count, categories) alongside data — pass `raw: true` to get the whole
  // envelope instead of just the unwrapped `data`.
  return raw ? payload : payload?.data;
}

export function apiGet(path, params, opts) {
  return request(path, { method: 'GET', params, ...opts });
}

export function apiPost(path, body) {
  return request(path, { method: 'POST', body });
}

export function apiPut(path, body) {
  return request(path, { method: 'PUT', body });
}

export function apiPatch(path, body) {
  return request(path, { method: 'PATCH', body });
}

export function apiDelete(path) {
  return request(path, { method: 'DELETE' });
}

export { BASE_URL };
