import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../lib/supabase';
import { TrashIcon, ChevronLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function OrderPage() {
  const { items, updateItem, removeItem, clearCart, totalItems } = useCart();
  const { client } = useAuth();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (items.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      await createOrder(client.id, items, notes);
      clearCart();
      setSubmitted(true);
    } catch (e) {
      setError('Failed to submit order: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-50 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Submitted!</h2>
          <p className="text-gray-500 mb-8">
            Your order has been received. We'll be in touch shortly.
          </p>
          <Link
            to="/"
            className="inline-block rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ChevronLeftIcon className="h-4 w-4" />
          Continue browsing
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Your Order {totalItems > 0 && <span className="text-gray-400 font-normal text-lg">({totalItems} items)</span>}
        </h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <p className="text-gray-400 mb-4">Your order is empty.</p>
            <Link to="/" className="text-sm font-medium text-gray-700 underline">Browse catalog</Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
                  {/* Image */}
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-2xl opacity-20">💍</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.product_name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.plating && (
                        <span className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-0.5">{item.plating}</span>
                      )}
                      {item.stone_color && (
                        <span className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-0.5">{item.stone_color}</span>
                      )}
                    </div>
                    {/* Quantity control */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => item.quantity > 1 ? updateItem(idx, { quantity: item.quantity - 1 }) : removeItem(idx)}
                        className="h-6 w-6 rounded border border-gray-200 text-gray-500 text-sm flex items-center justify-center hover:border-gray-400"
                      >−</button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(idx, { quantity: item.quantity + 1 })}
                        className="h-6 w-6 rounded border border-gray-200 text-gray-500 text-sm flex items-center justify-center hover:border-gray-400"
                      >+</button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any special requests or instructions…"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:border-gray-400 focus:outline-none resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit Order'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
