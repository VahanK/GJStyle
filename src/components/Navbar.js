import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon, ShoppingBagIcon, ArrowRightOnRectangleIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const CATEGORIES = ['Earrings','Rings','Bracelets','Necklaces','Sets','Pendants','Armlets','Shambala'];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { client, logout } = useAuth();
  const { totalItems } = useCart();
  const { favoriteIds } = useFavorites();

  function isActive(path) { return location.pathname === path; }
  function isCatActive(cat) { return location.pathname === `/catalog/${encodeURIComponent(cat)}`; }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <nav className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xl font-bold tracking-tight text-gray-900">GJ Style</span>
          <span className="hidden text-xs font-medium uppercase tracking-widest text-gray-400 sm:block">Jewelry</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
          <Link to="/" className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${isActive('/') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            All
          </Link>
          {CATEGORIES.map((cat) => (
            <Link key={cat} to={`/catalog/${encodeURIComponent(cat)}`}
              className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${isCatActive(cat) ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              {cat}
            </Link>
          ))}
          {!client?.isAdmin && (
            <>
              <span className="mx-2 text-gray-200">|</span>
              <Link to="/favorites"
                className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${isActive('/favorites') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <HeartIcon className="h-4 w-4" /> Favorites
                {favoriteIds.size > 0 && <span className="text-xs text-gray-400">({favoriteIds.size})</span>}
              </Link>
              <Link to="/orders"
                className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${isActive('/orders') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                My Orders
              </Link>
            </>
          )}
          {client?.isAdmin && (
            <>
              <span className="mx-2 text-gray-200">|</span>
              <Link to="/admin"
                className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${isActive('/admin') ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}>
                Admin
              </Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link to="/order" className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors">
            <ShoppingBagIcon className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Client name + logout */}
          {client && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs text-gray-400">{client.name}</span>
              <button onClick={logout} title="Sign out"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile burger */}
          <button className="lg:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4">
          <div className="mt-3 flex flex-col gap-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">All Categories</Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat} to={`/catalog/${encodeURIComponent(cat)}`} onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">{cat}</Link>
            ))}
            {!client?.isAdmin && (
              <>
                <div className="my-1 border-t border-gray-100" />
                <Link to="/favorites" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Favorites{favoriteIds.size > 0 ? ` (${favoriteIds.size})` : ''}</Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">My Orders</Link>
              </>
            )}
            {client?.isAdmin && (
              <>
                <div className="my-1 border-t border-gray-100" />
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50">Admin</Link>
              </>
            )}
            {client && (
              <button onClick={() => { logout(); setMobileOpen(false); }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 text-left">
                Sign out ({client.name})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
