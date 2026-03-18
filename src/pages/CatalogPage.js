import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../App';
import { ChevronLeftIcon, FunnelIcon } from '@heroicons/react/24/outline';

const PLATING_COLORS = {
  Gold: 'bg-yellow-400',
  Silver: 'bg-gray-300',
  Black: 'bg-gray-900',
  'Rose Gold': 'bg-rose-300',
};

export default function CatalogPage() {
  const { category } = useParams();
  const { products, error } = useProducts();
  const loading = false;
  const [activeSubcat, setActiveSubcat] = useState('All');
  const [search, setSearch] = useState('');

  // Filter by category
  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === decodeURIComponent(category)),
    [products, category]
  );

  // Build subcategory list
  const subcategories = useMemo(() => {
    const set = new Set();
    categoryProducts.forEach((p) => {
      (p.sub_categories || []).forEach((s) => set.add(s));
    });
    return ['All', ...Array.from(set).sort()];
  }, [categoryProducts]);

  // Apply filters
  const filtered = useMemo(() => {
    return categoryProducts.filter((p) => {
      const matchesSub =
        activeSubcat === 'All' || (p.sub_categories || []).includes(activeSubcat);
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.notes || '').toLowerCase().includes(search.toLowerCase());
      return matchesSub && matchesSearch;
    });
  }, [categoryProducts, activeSubcat, search]);

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8 py-6 lg:py-10">

        {/* Back + Title */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Catalog
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-semibold text-gray-900">
            {decodeURIComponent(category)}
          </h1>
        </div>

        {/* Search + filter bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FunnelIcon className="h-4 w-4" />
            <span>{filtered.length} products</span>
          </div>
        </div>

        {/* Subcategory tabs */}
        {subcategories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubcat(sub)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeSubcat === sub
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center text-red-700">
            Failed to load products: {error}
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="py-24 text-center text-gray-400">No products found.</div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const image = product.image_url || null;

  return (
    <Link to={`/product/${product.id}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative h-56 bg-gray-50 overflow-hidden">
        {image ? (
          <img src={image} alt={product.name} loading="lazy"
            className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl opacity-20">💍</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3">
        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>

        {(product.sub_categories || []).length > 0 && (
          <p className="text-xs text-gray-400 truncate">{product.sub_categories[0]}</p>
        )}

        {(product.plating || []).length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.plating.map((p) => (
              <span key={p} title={p}
                className={`inline-block h-3.5 w-3.5 rounded-full border border-gray-200 ${PLATING_COLORS[p] || 'bg-gray-400'}`} />
            ))}
          </div>
        )}

        {product.price ? (
          <p className="text-sm font-bold text-gray-900">${Number(product.price).toFixed(2)}</p>
        ) : (
          <p className="text-xs text-gray-400 italic">Price on request</p>
        )}
      </div>
    </Link>
  );
}
