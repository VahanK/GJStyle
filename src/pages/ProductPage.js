import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../App';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  ChevronLeftIcon, ShoppingBagIcon, CheckIcon, PlusIcon, TrashIcon, HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const PLATING_COLORS = {
  gold: 'bg-yellow-400 border-yellow-500',
  Gold: 'bg-yellow-400 border-yellow-500',
  silver: 'bg-gray-300 border-gray-400',
  Silver: 'bg-gray-300 border-gray-400',
  black: 'bg-gray-900 border-gray-900',
  Black: 'bg-gray-900 border-gray-900',
  'rose gold': 'bg-rose-300 border-rose-400',
  'Rose Gold': 'bg-rose-300 border-rose-400',
};

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function emptyVariant() {
  return { plating: '', stone_color: '', quantity: 1 };
}

export default function ProductPage() {
  const { id } = useParams();
  const { products, allProducts } = useProducts();
  const { client } = useAuth();
  const { addItem, totalItems } = useCart();
  const { favoriteIds, toggle: toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const product = products.find((p) => String(p.id) === String(id));

  // Variant images: other products linked to this one (parent_id = product.id)
  const variantImages = product
    ? (allProducts || products).filter((p) => p.parent_id === product.id && p.image_url)
    : [];

  // Build full image gallery: main image + extra_images + variant images
  const allImages = product ? [
    ...(product.image_url ? [{ url: product.image_url, label: 'Main' }] : []),
    ...(product.extra_images || []).map((url, i) => ({ url, label: `Detail ${i + 1}` })),
    ...variantImages.map((v) => ({ url: v.image_url, label: v.name })),
  ] : [];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [variants, setVariants] = useState([emptyVariant()]);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Product not found.
      </div>
    );
  }

  const hasStones = product.stones && product.stones.length > 0;
  const hasPlating = product.plating && product.plating.length > 0;
  const hasOptions = hasPlating || hasStones;

  function updateVariant(index, field, value) {
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  }

  function addVariantRow() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariant(index) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function isVariantValid(v) {
    if (hasPlating && !v.plating) return false;
    if (hasStones && !v.stone_color) return false;
    return v.quantity >= 1;
  }

  const validVariants = variants.filter(isVariantValid);
  const canAdd = validVariants.length > 0;

  function handleAdd() {
    if (!canAdd) return;
    validVariants.forEach((v) => {
      addItem(product, {
        quantity: v.quantity,
        plating: v.plating,
        stone_color: v.stone_color,
        notes: '',
      });
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const activeImage = allImages[activeImageIdx];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">

        {/* Back */}
        <Link
          to={`/catalog/${encodeURIComponent(product.category)}`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {product.category}
        </Link>

        <div className="grid gap-8 md:grid-cols-[1fr_1fr]">

          {/* ── Left: image gallery ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
              {activeImage ? (
                <img
                  src={activeImage.url}
                  alt={activeImage.label}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl opacity-20">💍</div>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    title={img.label}
                    className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      i === activeImageIdx
                        ? 'border-gray-900 shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: details ── */}
          <div className="flex flex-col">
            {/* Category badges */}
            <div className="mb-3 flex gap-2 flex-wrap">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {product.category}
              </span>
              {(product.sub_categories || []).map((s) => (
                <span key={s} className="rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs text-gray-500">
                  {s}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {client && !client.isAdmin && (
                <button onClick={() => toggleFavorite(product.id)}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  {favoriteIds.has(product.id)
                    ? <HeartSolid className="h-6 w-6 text-red-500" />
                    : <HeartIcon className="h-6 w-6 text-gray-300 hover:text-red-300" />}
                </button>
              )}
            </div>

            {product.price && (
              <p className="text-xl font-semibold text-gray-900 mb-6">${Math.round(product.price)}</p>
            )}

            {/* ── Order section ── */}
            <div className="rounded-2xl border border-gray-200 p-4 space-y-4 mb-4">
              <p className="text-sm font-semibold text-gray-800">
                {hasOptions ? 'Select options & quantities' : 'Quantity'}
              </p>

              {/* Variant rows */}
              <div className="space-y-3">
                {variants.map((v, index) => (
                  <div key={index} className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-3">
                    {/* Row header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        {variants.length > 1 ? `Option ${index + 1}` : 'Your order'}
                      </span>
                      {variants.length > 1 && (
                        <button onClick={() => removeVariant(index)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Plating */}
                    {hasPlating && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          Plating <span className="text-red-400">*</span>
                          {!v.plating && <span className="ml-1 text-gray-400 italic">(choose one)</span>}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {product.plating.map((p) => (
                            <button
                              key={p}
                              onClick={() => updateVariant(index, 'plating', p)}
                              className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-all ${
                                v.plating === p
                                  ? 'border-gray-900 bg-gray-900 text-white'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              <span className={`h-3 w-3 rounded-full border ${PLATING_COLORS[p] || 'bg-gray-400 border-gray-500'}`} />
                              {capitalize(p)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stone */}
                    {hasStones && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          Stone Color <span className="text-red-400">*</span>
                          {!v.stone_color && <span className="ml-1 text-gray-400 italic">(choose one)</span>}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {product.stones.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateVariant(index, 'stone_color', s)}
                              className={`rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-all ${
                                v.stone_color === s
                                  ? 'border-gray-900 bg-gray-900 text-white'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              {capitalize(s)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">Quantity</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateVariant(index, 'quantity', Math.max(1, v.quantity - 1))}
                          className="h-8 w-8 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-white flex items-center justify-center font-medium text-base"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-base font-bold text-gray-900">{v.quantity}</span>
                        <button
                          onClick={() => updateVariant(index, 'quantity', v.quantity + 1)}
                          className="h-8 w-8 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-white flex items-center justify-center font-medium text-base"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add another option */}
              {hasOptions && (
                <button
                  onClick={addVariantRow}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors w-full justify-center py-1.5 rounded-lg border border-dashed border-gray-200 hover:border-gray-400"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add another plating / color
                </button>
              )}
            </div>

            {/* Add to order button */}
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                  added
                    ? 'bg-green-600 text-white'
                    : canAdd
                    ? 'bg-gray-900 text-white hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {added ? (
                  <><CheckIcon className="h-5 w-5" /> Added to Order</>
                ) : (
                  <><ShoppingBagIcon className="h-5 w-5" />
                    {validVariants.length > 1
                      ? `Add ${validVariants.length} options to Order`
                      : 'Add to Order'}
                  </>
                )}
              </button>
              {totalItems > 0 && (
                <button
                  onClick={() => navigate('/order')}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                >
                  View Order ({totalItems})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
