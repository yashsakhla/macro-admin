// localStorage session helpers scoped to Macropage Connect only.
// Kept separate from the portal-wide demo session (AuthContext.jsx).

const STORAGE_KEY = 'macropage_connect_session';

export function getSession() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getToken() {
  return getSession()?.accessToken || null;
}
