import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductsPage from './pages/ProductsPage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import OrderPage from './pages/OrderPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './App.css';

// Global products context
export const ProductsContext = createContext({ products: [] });
export function useProducts() { return useContext(ProductsContext); }

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50bGlzdHF0Y2Fwc3NnZmVieHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzY5OTMsImV4cCI6MjA4OTI1Mjk5M30.92TYInIQg--yFrsc8DL6mc9feJAT052CINwG6MEjzHw';
const TOTAL_PRODUCTS = 2200; // approximate — used for progress bar estimate

function AppInner() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const { client, authLoading } = useAuth();

  useEffect(() => {
    setProductsLoading(true);
    setLoadedCount(0);
    setLoadError(null);
    async function load() {
      try {
        const PAGE = 1000;
        let all = [];
        let from = 0;
        while (true) {
          const res = await fetch(
            `https://ntlistqtcapssgfebxvc.supabase.co/rest/v1/products?select=id,name,category,sub_categories,plating,stones,image_url,extra_images,price,notes,parent_id,deleted_at&order=id.asc`,
            {
              headers: {
                apikey: ANON_KEY,
                Authorization: `Bearer ${ANON_KEY}`,
                Range: `${from}-${from + PAGE - 1}`,
                'Range-Unit': 'items',
                Prefer: 'count=none',
              },
            }
          );
          if (!res.ok) throw new Error(`Server error: ${res.status}`);
          const rows = await res.json();
          if (!Array.isArray(rows) || rows.length === 0) break;
          all = all.concat(rows);
          setLoadedCount(all.length);
          if (rows.length < PAGE) break;
          from += PAGE;
        }
        // allProducts = everything (admin needs deleted + variants)
        // activeProducts = no deleted, no variants (catalog + clients)
        setProducts(all);
        setProductsLoading(false);

      } catch (e) {
        console.error('Failed to load products', e);
        setLoadError(e.message || 'Connection failed');
        setProductsLoading(false);
      }
    }
    load();
  }, [retryKey]);

  if (authLoading) return null;

  // Show loading screen while fetching products (only after login)
  if (client && productsLoading) {
    const progress = Math.min(99, Math.round((loadedCount / TOTAL_PRODUCTS) * 100));
    return <LoadingScreen progress={progress} loaded={loadedCount} />;
  }

  // Show error screen if fetch failed
  if (client && loadError) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white gap-4">
        <h1 className="text-2xl font-bold text-gray-900">GJ Style</h1>
        <p className="text-sm text-red-500">Failed to load catalog — {loadError}</p>
        <button
          onClick={() => setRetryKey((k) => k + 1)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Active products: exclude soft-deleted and variants (parent_id set)
  const activeProducts = products.filter((p) => !p.deleted_at && !p.parent_id);

  // Filter products based on logged-in client's visibility
  function getVisibleProducts() {
    if (!client) return activeProducts;
    if (client.isAdmin) return activeProducts;
    const allowedCats = client.allowed_categories || [];
    const allowedSubs = client.allowed_subcategories || [];
    const allowedIds = client.allowed_product_ids || [];

    if (allowedCats.length === 0 && allowedIds.length === 0) return [];

    return activeProducts.filter((p) => {
      if (allowedIds.includes(p.id)) return true;
      if (allowedCats.includes(p.category)) {
        const catSubs = (p.sub_categories || []);
        const clientCatSubs = allowedSubs.filter((s) =>
          [...(new Set(activeProducts.filter((x) => x.category === p.category).flatMap((x) => x.sub_categories || [])))].includes(s)
        );
        if (clientCatSubs.length > 0) {
          return catSubs.some((s) => allowedSubs.includes(s));
        }
        return true;
      }
      return false;
    });
  }

  const visibleProducts = client ? getVisibleProducts() : activeProducts;

  return (
    // allProducts = everything including deleted/variants (admin only)
    <ProductsContext.Provider value={{ products: visibleProducts, allProducts: products }}>
      <CartProvider>
        <Router>
          {client && <Navbar />}
          <Routes>
            {!client ? (
              <>
                <Route path="*" element={<LoginPage />} />
              </>
            ) : (
              <>
                <Route index element={<ProductsPage />} />
                <Route path="catalog/:category" element={<CatalogPage />} />
                <Route path="product/:id" element={<ProductPage />} />
                <Route path="order" element={<OrderPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="admin" element={client?.isAdmin ? <AdminPage /> : <Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </Router>
      </CartProvider>
    </ProductsContext.Provider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
