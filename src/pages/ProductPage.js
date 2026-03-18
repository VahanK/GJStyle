import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../App';
import { useCart } from '../context/CartContext';
import { ChevronLeftIcon, ShoppingBagIcon, CheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const PLATING_COLORS = {
  Gold: 'bg-yellow-400 border-yellow-500',
  Silver: 'bg-gray-300 border-gray-400',
  Black: 'bg-gray-900 border-gray-900',
  'Rose Gold': 'bg-rose-300 border-rose-400',
};

const STONE_COLORS = {
  Clear: 'bg-white border-gray-300',
  'Ruby Red': 'bg-red-500 border-red-600',
  'Sapphire Blue': 'bg-blue-500 border-blue-600',
  'Emerald Green': 'bg-emerald-500 border-emerald-600',
  'Amethyst Purple': 'bg-purple-500 border-purple-600',
  'Topaz Yellow': 'bg-yellow-300 border-yellow-400',
};

function emptyVariant() {
  return { plating: '', stone_color: '', quantity: 1 };
}

export default function ProductPage() {
  const { id } = useParams();
  const { products } = useProducts();
  const { addItem, totalItems } = useCart();
  const navigate = useNavigate();

  const product = products.find((p) => String(p.id) === String(id));

  // Multiple variants — each row = one plating+stone+qty combo
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

  function updateVariant(index, field, value) {
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  }

  function addVariant() {
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

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">

        {/* Back */}
        <Link
          to={`/catalog/${encodeURIComponent(product.category)}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {product.category}
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl opacity-20">💍</div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Badges */}
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

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

            {product.price && (
              <p className="text-xl font-semibold text-gray-900 mb-4">${product.price.toFixed(2)}</p>
            )}

            {product.notes && (
              <p className="text-sm text-gray-500 mb-6">{product.notes}</p>
            )}

            {/* Variants */}
            <div className="mb-6 space-y-4">
              <p className="text-sm font-medium text-gray-700">
                {hasPlating || hasStones ? 'Select options & quantities' : 'Quantity'}
              </p>

              {variants.map((v, index) => (
                <div key={index} className="rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Variant {variants.length > 1 ? index + 1 : ''}
                    </span>
                    {variants.length > 1 && (
                      <button onClick={() => removeVariant(index)}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Plating */}
                  {hasPlating && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Plating <span className="text-red-400">*</span></p>
                      <div className="flex flex-wrap gap-2">
                        {product.plating.map((p) => (
                          <button key={p} onClick={() => updateVariant(index, 'plating', p)}
                            className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-all ${
                              v.plating === p
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-200 text-gray-700 hover:border-gray-400'
                            }`}>
                            <span className={`h-3 w-3 rounded-full border ${PLATING_COLORS[p] || 'bg-gray-400 border-gray-500'}`} />
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stone */}
                  {hasStones && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Stone Color <span className="text-red-400">*</span></p>
                      <div className="flex flex-wrap gap-2">
                        {product.stones.map((s) => (
                          <button key={s} onClick={() => updateVariant(index, 'stone_color', s)}
                            className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-all ${
                              v.stone_color === s
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-200 text-gray-700 hover:border-gray-400'
                            }`}>
                            <span className={`h-3 w-3 rounded-full border ${STONE_COLORS[s] || 'bg-gray-300 border-gray-400'}`} />
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Quantity</p>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateVariant(index, 'quantity', Math.max(1, v.quantity - 1))}
                        className="h-8 w-8 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 flex items-center justify-center font-medium">
                        −
                      </button>
                      <span className="w-8 text-center text-base font-semibold text-gray-900">{v.quantity}</span>
                      <button onClick={() => updateVariant(index, 'quantity', v.quantity + 1)}
                        className="h-8 w-8 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 flex items-center justify-center font-medium">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add another variant */}
              <button onClick={addVariant}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <PlusIcon className="h-4 w-4" />
                Add another color / quantity
              </button>
            </div>

            {/* Add to order */}
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
                    Add {validVariants.length > 1 ? `${validVariants.length} variants` : ''} to Order
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
