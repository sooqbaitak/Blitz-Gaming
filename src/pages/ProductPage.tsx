import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingCart, MessageCircle, Truck, Shield, Banknote, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/utils';
import { ProductGrid } from '../components/ProductGrid';
import { findCategory } from '../lib/categories';

export function ProductPage() {
  const { slug = '' } = useParams();
  const { getProduct, addToCart, toggleFavorite, favorites, products, storeInfo, rateProduct } = useStore();
  const product = getProduct(slug);
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const defaults = useMemo(() => {
    if (!product) return {};
    const d: Record<string, string> = {};
    product.variants.forEach((v) => {
      if (v.options[0]) d[v.name] = selected[v.name] ?? v.options[0];
    });
    return d;
  }, [product, selected]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/shop" className="text-violet-400 mt-4 inline-block">
          Back to shop
        </Link>
      </div>
    );
  }

  const fav = favorites.includes(product.id);
  const galleryImages = [...new Set([product.image, ...(product.images ?? [])].filter(Boolean))].slice(0, 5);
  const activeImage = galleryImages.includes(selectedImage) ? selectedImage : galleryImages[0] ?? product.image;
  const out = product.stock === 'out_of_stock';
  const cat = findCategory(product.category);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    if (out) return;
    addToCart(product.id, qty, defaults);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const waText = encodeURIComponent(
    `Hi Blitz Gaming! I'm asking about: ${product.title} (${formatPrice(product.price)})`,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-xs text-zinc-500 mb-6 flex gap-2 flex-wrap">
        <Link to="/" className="hover:text-white">Home</Link>
        <span>/</span>
        {cat && (
          <>
            <Link to={`/category/${cat.slug}`} className="hover:text-white">{cat.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-zinc-300 line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="rounded-3xl overflow-hidden border border-white/8 bg-[#12141c] aspect-square">
            <img src={activeImage} alt={product.title} className="w-full h-full object-contain" />
          </div>
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {galleryImages.map((image, index) => (
                <button key={`${image.slice(0, 30)}-${index}`} type="button" onClick={() => setSelectedImage(image)} className={`aspect-square overflow-hidden rounded-xl border ${activeImage === image ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-white/10'}`} aria-label={`View product image ${index + 1}`}>
                  <img src={image} alt={`${product.title} view ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-violet-400 font-medium uppercase tracking-wider">{product.brand}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 leading-tight">{product.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2" aria-label={`Average rating ${(product.rating ?? 0).toFixed(1)} out of 5`}>
            <div className="flex items-center" role="img" aria-label={`${(product.rating ?? 0).toFixed(1)} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-4 h-4 ${star <= Math.round(product.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
              ))}
            </div>
            <span className="text-xs text-zinc-400">{product.ratingCount ? `${(product.rating ?? 0).toFixed(1)} (${product.ratingCount} rating${product.ratingCount === 1 ? '' : 's'})` : 'No ratings yet'}</span>
            <span className="text-xs text-zinc-500">Rate it:</span>
            <div className="flex" aria-label="Submit a star rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => rateProduct(product.id, star)} className="p-0.5 hover:scale-110 transition" aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}>
                  <Star className={`w-4 h-4 ${star <= Math.round(product.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-zinc-600 hover:text-amber-300'}`} />
                </button>
              ))}
            </div>
          </div>

          {product.label && (
            <span className="inline-block mt-3 px-2.5 py-1 rounded-md text-xs font-bold bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/30">
              {product.label}
            </span>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-black">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-zinc-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p
            className={`mt-2 text-sm font-medium ${
              out ? 'text-red-400' : product.stock === 'preorder' ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {out ? 'Out of stock' : product.stock === 'preorder' ? 'Available for pre-order' : 'In stock — ready to ship'}
          </p>

          <p className="mt-5 text-zinc-400 text-sm leading-relaxed">{product.description}</p>

          {product.variants.map((v) => (
            <div key={v.id} className="mt-6">
              <label className="text-sm font-medium text-zinc-300">
                {v.name}
                {defaults[v.name] && (
                  <span className="text-zinc-500 font-normal"> — {defaults[v.name]}</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelected((s) => ({ ...s, [v.name]: opt }))}
                    className={`px-4 py-2 rounded-xl text-sm border transition ${
                      defaults[v.name] === opt
                        ? 'border-violet-500 bg-violet-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/30'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
              <h3 className="text-sm font-semibold p-4 border-b border-white/10">Specifications</h3>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, value], index) => (
                    <tr key={key} className={index % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                      <th scope="row" className="w-2/5 text-left font-medium text-zinc-500 p-3 align-top">{key}</th>
                      <td className="text-zinc-200 p-3 whitespace-pre-wrap">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {product.shippingWarranty && (
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <h3 className="text-sm font-semibold mb-2">Shipping & warranty</h3>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{product.shippingWarranty}</p>
            </div>
          )}

          {(product.loyaltyPoints ?? 0) > 0 && (
            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-200">
              Earn {product.loyaltyPoints} loyalty point{product.loyaltyPoints === 1 ? '' : 's'} per unit when your account order is delivered.
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-white/10 rounded-xl overflow-hidden">
              <button
                type="button"
                className="w-11 h-11 flex items-center justify-center hover:bg-white/5"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{qty}</span>
              <button
                type="button"
                className="w-11 h-11 flex items-center justify-center hover:bg-white/5"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={out}
              onClick={handleAdd}
              className="flex-1 min-w-[160px] h-11 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              {added ? 'Added!' : 'Add to cart'}
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5"
            >
              <Heart className={`w-5 h-5 ${fav ? 'fill-fuchsia-500 text-fuchsia-500' : ''}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              handleAdd();
              navigate('/checkout');
            }}
            disabled={out}
            className="mt-3 w-full h-11 rounded-xl border border-white/15 font-medium hover:bg-white/5 disabled:opacity-40 transition"
          >
            Buy now — Cash on Delivery
          </button>

          <a
            href={`https://wa.me/${storeInfo.whatsappDigits}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 w-full h-11 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] font-medium flex items-center justify-center gap-2 hover:bg-[#25D366]/25 transition"
          >
            <MessageCircle className="w-4 h-4" /> Ask about availability
          </a>

          <div className="mt-8 grid sm:grid-cols-3 gap-3 text-xs text-zinc-400">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
              Cash on delivery — no advance payment
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Truck className="w-4 h-4 text-sky-400 shrink-0" />
              Delivery areas selected at checkout
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              Genuine products with warranty
            </div>
          </div>

          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <Link
                  key={t}
                  to={`/shop?q=${encodeURIComponent(t)}`}
                  className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-zinc-400 hover:text-white"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Related products</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
