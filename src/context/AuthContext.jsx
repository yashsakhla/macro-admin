import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

// Exported so the Macropage Connect API client can clear this session too on
// a 401 — there is only one login for the whole portal (see Login.jsx).
export const STORAGE_KEY = 'admin_portal_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  // Called after the single login screen (Login.jsx) authenticates against
  // the real Macropage Connect API — establishes the portal-wide session so
  // every product (including the two still on mock data) is reachable
  // without a second login.
  function loginWithUser(sessionUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, loginWithUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
