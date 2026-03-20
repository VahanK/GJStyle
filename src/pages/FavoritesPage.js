import { Link } from 'react-router-dom';
import { useProducts } from '../App';
import { useFavorites } from '../context/FavoritesContext';
import { HeartIcon } from '@heroicons/react/24/solid';

export default function FavoritesPage() {
  const { products } = useProducts();
  const { favoriteIds, toggle } = useFavorites();

  const favorites = products.filter((p) => favoriteIds.has(p.id));

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Favorites</h1>
        <p className="text-sm text-gray-500 mb-8">Products you've saved for later.</p>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">No favorites yet.</p>
            <p className="text-sm text-gray-400 mt-1">Tap the heart icon on any product to save it here.</p>
            <Link to="/" className="mt-4 inline-block text-sm font-medium text-gray-900 underline hover:text-gray-600">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favorites.map((product) => (
              <div key={product.id} className="group relative flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                {/* Remove from favorites */}
                <button
                  onClick={() => toggle(product.id)}
                  className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                >
                  <HeartIcon className="h-5 w-5 text-red-500" />
                </button>

                <Link to={`/product/${product.id}`} className="flex flex-col flex-1">
                  <div className="h-56 bg-gray-50 overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl opacity-20">💍</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.category}</p>
                    {product.price ? (
                      <p className="text-sm font-bold text-gray-900">${Math.round(product.price)}</p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Price on request</p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
