import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchClientFavorites, addFavorite, removeFavorite } from '../lib/supabase';

const FavoritesContext = createContext({ favoriteIds: new Set(), toggle: () => {}, loading: true });

export function FavoritesProvider({ children }) {
  const { client } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!client || client.isAdmin) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    try {
      const data = await fetchClientFavorites(client.id);
      setFavoriteIds(new Set((data || []).map((f) => f.product_id)));
    } catch (e) {
      console.error('Favorites load error:', e);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { load(); }, [load]);

  async function toggle(productId) {
    if (!client || client.isAdmin) return;
    const isFav = favoriteIds.has(productId);
    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(productId);
      else next.add(productId);
      return next;
    });
    try {
      if (isFav) await removeFavorite(client.id, productId);
      else await addFavorite(client.id, productId);
    } catch (e) {
      // Revert on error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggle, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
