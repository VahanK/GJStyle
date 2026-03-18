import { createContext, useContext, useState, useEffect } from 'react';
import { fetchClientByPassword } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [client, setClient] = useState(null); // logged-in client object
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session from localStorage on load
  useEffect(() => {
    const saved = localStorage.getItem('gj_client');
    if (saved) {
      try { setClient(JSON.parse(saved)); } catch (_) {}
    }
    setAuthLoading(false);
  }, []);

  async function login(password) {
    // Hardcoded admin bypass — use this to access admin before any clients are created
    if (password === 'gjadmin2024') {
      const adminUser = { id: 0, name: 'Admin', isAdmin: true, allowed_categories: null, allowed_subcategories: [], allowed_product_ids: [] };
      setClient(adminUser);
      localStorage.setItem('gj_client', JSON.stringify(adminUser));
      return adminUser;
    }
    const found = await fetchClientByPassword(password);
    if (!found) throw new Error('Invalid password or account inactive.');
    setClient(found);
    localStorage.setItem('gj_client', JSON.stringify(found));
    return found;
  }

  function logout() {
    setClient(null);
    localStorage.removeItem('gj_client');
  }

  // Refresh client data (e.g. after admin updates visibility)
  async function refreshClient() {
    if (!client) return;
    const saved = localStorage.getItem('gj_client');
    if (saved) {
      try {
        const fresh = await fetchClientByPassword(JSON.parse(saved).password);
        if (fresh) {
          setClient(fresh);
          localStorage.setItem('gj_client', JSON.stringify(fresh));
        }
      } catch (_) {}
    }
  }

  return (
    <AuthContext.Provider value={{ client, authLoading, login, logout, refreshClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
