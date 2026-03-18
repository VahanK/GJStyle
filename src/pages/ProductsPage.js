import { Link } from 'react-router-dom';
import { useProducts } from '../App';

const CATEGORY_FALLBACK_IMAGES = {
  Earrings:  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&q=75&fit=crop&w=750',
  Rings:     'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&q=75&fit=crop&w=750',
  Bracelets: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?auto=format&q=75&fit=crop&w=750',
  Necklaces: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&q=75&fit=crop&w=750',
  Sets:      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&q=75&fit=crop&w=750',
  Pendants:  'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&q=75&fit=crop&w=750',
  Armlets:   'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&q=75&fit=crop&w=750',
  Shambala:  'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&q=75&fit=crop&w=750',
};

// Thresholds — tweak as needed
const MANY = 30;  // ≥ 30 products → tight 6-col grid
const FEW  = 8;   // < 8 products  → loose 2-col grid, bigger images

export default function ProductsPage() {
  const { products } = useProducts();

  // Group products by category
  const categoryMap = {};
  products.forEach((p) => {
    if (!categoryMap[p.category]) categoryMap[p.category] = [];
    categoryMap[p.category].push(p);
  });

  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, prods]) => ({ name, prods, count: prods.length }));

  return (
    <div className="bg-white py-6 sm:py-8 lg:py-12">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-16">
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl">
            Catalog
          </h2>
          <p className="mx-auto max-w-screen-md text-center text-gray-500 md:text-lg">
            Browse our full jewelry collection. Select a category to explore all available styles.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {categories.map((cat) => (
            <CategoryCard key={cat.name} cat={cat} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ cat }) {
  const { name, prods, count } = cat;

  // Pick products that have images, fallback to any
  const withImages = prods.filter((p) => p.image_url);
  const hasProdImages = withImages.length > 0;

  // Decide grid density based on count
  let cols, maxShow, imgHeight;
  if (count >= MANY) {
    cols = 6; maxShow = 12; imgHeight = 'h-20';
  } else if (count >= FEW) {
    cols = 4; maxShow = 8; imgHeight = 'h-28';
  } else {
    cols = 2; maxShow = 4; imgHeight = 'h-40';
  }

  const displayProds = withImages.slice(0, maxShow);
  const remaining = count - displayProds.length;

  return (
    <Link
      to={`/catalog/${encodeURIComponent(name)}`}
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-200"
    >
      {/* Product image grid or fallback */}
      {hasProdImages ? (
        <div
          className="grid gap-0.5 bg-gray-100"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {displayProds.map((p) => (
            <div key={p.id} className={`relative ${imgHeight} overflow-hidden bg-gray-50`}>
              <img
                src={p.image_url}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
          ))}
          {/* Remaining count tile */}
          {remaining > 0 && displayProds.length >= maxShow && (
            <div className={`${imgHeight} bg-gray-800 flex items-center justify-center`}>
              <span className="text-white text-sm font-semibold">+{remaining}</span>
            </div>
          )}
        </div>
      ) : (
        // No product images yet — use fallback category image
        <div className="relative h-56 overflow-hidden">
          <img
            src={CATEGORY_FALLBACK_IMAGES[name] || CATEGORY_FALLBACK_IMAGES['Earrings']}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Footer label */}
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 text-sm">{name}</p>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{count}</span>
        </div>
        <span className="text-xs font-medium text-gray-400 group-hover:text-gray-700 transition-colors">
          View all →
        </span>
      </div>
    </Link>
  );
}
