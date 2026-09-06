import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Star } from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { showNotification } from '../../store/slices/notificationSlice';
import { formatINR, percentOff, productImage } from '../../utils/format';
import Badge from '../ui/Badge';

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating || 0) ? 'fill-gold text-gold' : 'fill-line text-line'}`} />
      ))}
    </span>
  );
}

export default function ProductCard({ product: p }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const wishlistIds = useSelector((s) => s.wishlist.items.map((w) => w._id));
  const loading = useSelector((s) => s.cart.loading);
  const [adding, setAdding] = useState(false);

  const off = percentOff(p.price, p.originalPrice);
  const wished = wishlistIds.includes(p._id);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    if (!user) {
      dispatch(showNotification({ message: 'Please login to add items to your bag.', type: 'error' }));
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await dispatch(addToCart({ productId: p._id, quantity: 1 })).unwrap();
      dispatch(showNotification({ message: '✓ Added to cart — ' + p.name.slice(0, 34), type: 'cart' }));
    } catch (err) {
      dispatch(showNotification({ message: err.message || 'Could not add to cart.', type: 'error' }));
    } finally {
      setAdding(false);
    }
  };

  const handleWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      dispatch(showNotification({ message: 'Please login to save items.', type: 'error' }));
      navigate('/login');
      return;
    }
    try {
      await dispatch(toggleWishlist(p._id)).unwrap();
      dispatch(showNotification({ message: wished ? 'Removed from wishlist.' : 'Added to wishlist ❤️' }));
    } catch (err) {
      dispatch(showNotification({ message: err.message || 'Something went wrong.', type: 'error' }));
    }
  };

  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm">
        <Link to={`/product/${p.slug}`}>
          <div className="aspect-square w-full overflow-hidden">
            <img src={productImage(p)} alt={p.name} loading="lazy" className="img-zoom h-full w-full object-cover" />
          </div>
        </Link>

        {off > 0 && <Badge variant="accent" className="absolute top-3 left-3">-{off}%</Badge>}
        {p.bestseller && <Badge variant="navy" className="absolute top-3 right-3">Bestseller</Badge>}
        {p.tags?.includes('personalised') && !p.bestseller && (
          <Badge variant="light" className="absolute top-3 right-3 bg-white/90">Personalise</Badge>
        )}

        <button
          onClick={handleWish}
          aria-label="Add to wishlist"
          className={`absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition ${wished ? 'bg-accent text-white' : 'bg-white text-muted hover:text-accent'}`}
        >
          <Heart className={`h-4 w-4 ${wished ? 'fill-white' : ''}`} />
        </button>
      </div>

      <div className="px-1 pt-3">
        <Link to={`/product/${p.slug}`} className="line-clamp-2 block text-sm font-medium text-ink hover:text-accent">
          {p.name}
        </Link>
        <div className="mt-1 flex items-center gap-1.5">
          <Stars rating={p.rating} />
          <span className="text-xs text-muted">({p.reviewCount})</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-bold text-primary">{formatINR(p.price)}</span>
          {p.originalPrice > p.price && <span className="text-sm text-muted line-through">{formatINR(p.originalPrice)}</span>}
        </div>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="mt-3 w-full rounded-full border border-primary py-2 text-xs font-semibold tracking-wide text-primary uppercase transition hover:bg-primary hover:text-white disabled:opacity-50"
        >
          {adding ? 'Adding…' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
}