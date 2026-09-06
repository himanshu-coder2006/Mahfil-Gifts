import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Minus, Plus, Check } from 'lucide-react';
import { productAPI } from '../services/api';
import { addToCart } from '../store/slices/cartSlice';
import { showNotification } from '../store/slices/notificationSlice';
import { formatINR, percentOff, productImage } from '../utils/format';
import ProductGrid from '../components/product/ProductGrid';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/Loader';

export function isPersonalisable(p) {
  return !!p && (((p.tags || []).includes('personalised')) || /personal|custom|kids/i.test(p.name || ''));
}

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [personalisation, setPersonalisation] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    setActiveImg(0);
    setQty(1);
    setPersonalisation('');
    productAPI
      .getBySlug(slug)
      .then((res) => {
        const p = res.data;
        setProduct(p);
        if (p?.category?.slug) {
          productAPI.getAll({ category: p.category.slug, sort: 'popular' })
            .then((r) => setRelated((r.data || []).filter((x) => x._id !== p._id).slice(0, 4)))
            .catch(() => {});
        }
      })
      .catch(() => dispatch(showNotification({ message: 'Product not found.', type: 'error' })))
      .finally(() => setLoading(false));
  }, [slug, dispatch]);

  const images = useMemo(() => {
    if (!product) return [];
    return product.images?.length ? product.images : [productImage(product)];
  }, [product]);

  const off = product ? percentOff(product.price, product.originalPrice) : 0;
  const personalisable = isPersonalisable(product);

  const requireLogin = () => {
    dispatch(showNotification({ message: 'Please login to add items to your bag.', type: 'error' }));
    navigate('/login');
  };

  const doAdd = async (goCheckout) => {
    if (!user) { requireLogin(); return; }
    if (busy) return;
    if (personalisable && personalisation.trim() && personalisation.length > 12) {
      dispatch(showNotification({ message: 'Name should be 12 characters or less.', type: 'error' }));
      return;
    }
    setBusy(true);
    try {
      const variant = {};
      if (personalisation.trim()) variant.personalisation = personalisation.trim();
      await dispatch(addToCart({ productId: product._id, quantity: qty, variant })).unwrap();
      dispatch(showNotification({ message: '✓ Added to bag — ' + product.name.slice(0, 30), type: 'cart' }));
      if (goCheckout) navigate('/checkout');
    } catch (err) {
      dispatch(showNotification({ message: err.message || 'Could not add to cart.', type: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) {
    return (
      <div className="py-24 text-center">
        <p className="text-4xl">😢</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-primary">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-accent hover:underline">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-light">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <Link to="/" className="hover:text-accent">Home</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-accent">{product.category?.name}</Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="group sticky top-24 overflow-hidden rounded-2xl bg-card shadow-sm">
              <img src={images[activeImg]} alt={product.name} className="aspect-square w-full object-cover" />
              {off > 0 && <Badge variant="accent" className="absolute top-4 left-4 !px-3 !py-1 text-xs">Save {off}%</Badge>}
              {product.bestseller && <Badge variant="navy" className="absolute top-4 right-4">Bestseller</Badge>}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition ${i === activeImg ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display text-2xl leading-snug font-bold text-primary md:text-3xl">{product.name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= Math.round(product.rating) ? 'fill-gold text-gold' : 'fill-line text-line'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-primary">{product.rating}</span>
              <span className="text-sm text-muted">({product.reviewCount} reviews)</span>
            </div>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-accent">{formatINR(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-muted line-through">{formatINR(product.originalPrice)}</span>
              )}
              {off > 0 && <Badge variant="green" className="!px-2.5 !py-1">({off}% OFF)</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted">Inclusive of all taxes · Free delivery above ₹999</p>

            {personalisable && (
              <div className="mt-6 rounded-2xl bg-card p-4 shadow-sm">
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-primary uppercase">
                  Personalise this gift ✍️
                </label>
                <input
                  value={personalisation}
                  maxLength={12}
                  onChange={(e) => setPersonalisation(e.target.value)}
                  placeholder="Enter name / text (max 12 characters)"
                  className="field"
                />
                <p className="mt-1 text-[11px] text-muted">
                  {12 - personalisation.length} characters left — name will be printed on the product.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-line bg-white">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3.5 py-2.5 text-primary hover:text-accent" aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-primary">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="px-3.5 py-2.5 text-primary hover:text-accent" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button variant="accent" size="lg" onClick={() => doAdd(false)} disabled={busy}>
                Add to Bag
              </Button>
              <Button variant="primary" size="lg" onClick={() => doAdd(true)} disabled={busy}>
                Buy Now
              </Button>
            </div>
            {!user && <p className="mt-3 text-xs text-accent">You'll be asked to login to place your order.</p>}

            {/* Specs */}
            {product.specifications?.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-lg font-bold text-primary">Features</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {product.specifications.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span><span className="font-semibold text-primary">{s.key}:</span> {s.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="font-display text-lg font-bold text-primary">About this gift</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/80">{product.description || product.shortDescription}</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-line pt-10">
            <h2 className="font-display text-2xl font-bold text-primary">You may also like</h2>
            <div className="section-underline mb-6" />
            <ProductGrid products={related} cols={4} />
          </section>
        )}
      </div>
    </div>
  );
}