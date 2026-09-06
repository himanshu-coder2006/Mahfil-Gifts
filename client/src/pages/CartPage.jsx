import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { showNotification } from '../store/slices/notificationSlice';
import { formatINR } from '../utils/format';
import { computeCartTotals } from '../utils/order';
import { getSettings } from '../utils/storage';
import Button from '../components/ui/Button';

export default function CartPage() {
  const items = useSelector((s) => s.cart.items);
  const loading = useSelector((s) => s.cart.loading);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const settings = getSettings();

  const totals = useMemo(() => computeCartTotals(items), [items]);
  const freeThreshold = settings.freeShippingThreshold;
  const progress = Math.min(100, Math.round((totals.subtotal / freeThreshold) * 100));

  const updateQty = (item, delta) => {
    const next = Math.max(1, Math.min(10, item.quantity + delta));
    if (next === item.quantity) return;
    dispatch(updateCartItem({ id: item._id, quantity: next }))
      .unwrap()
      .catch((err) => dispatch(showNotification({ message: err.message || 'Could not update quantity.', type: 'error' })));
  };

  const removeItem = (item) => {
    dispatch(removeFromCart(item._id))
      .unwrap()
      .then(() => dispatch(showNotification({ message: 'Removed from bag.' })))
      .catch((err) => dispatch(showNotification({ message: err.message || 'Could not remove item.', type: 'error' })));
  };

  if (loading && items.length === 0) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted">Loading your bag…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center md:px-6">
        <p className="text-6xl">🛍️</p>
        <h1 className="mt-6 font-display text-3xl font-bold text-primary">Your bag is empty</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          It looks like you haven't added any gifts yet. Let's fix that with something special.
        </p>
        <Link to="/shop" className="mt-8 inline-block"><Button variant="accent" size="lg">Shop Now</Button></Link>
      </div>
    );
  }

  return (
    <div className="bg-light">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-bold text-primary">Your Bag</h1>
        <p className="mt-1 text-sm text-muted">{totals.totalItems} {totals.totalItems === 1 ? 'item' : 'items'}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => {
              const product = item.product || {};
              const price = Number(product.price || item.price || 0);
              return (
                <div key={item._id} className="card flex gap-4 p-4">
                  <Link to={`/product/${product.slug || ''}`} className="shrink-0">
                    <img
                      src={product.thumbnail || product.images?.[0]}
                      alt={product.name}
                      className="h-28 w-28 rounded-xl object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/product/${product.slug || ''}`} className="line-clamp-2 text-sm font-semibold text-primary hover:text-accent">
                          {product.name}
                        </Link>
                        {item.variant?.personalisation && (
                          <p className="mt-1 text-xs text-muted">
                            Personalised with: <span className="font-semibold text-accent">“{item.variant.personalisation}”</span>
                          </p>
                        )}
                      </div>
                      <button onClick={() => removeItem(item)} className="text-muted hover:text-accent" aria-label="Remove item">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                      <div className="flex items-center rounded-full border border-line bg-light">
                        <button onClick={() => updateQty(item, -1)} className="px-3 py-1.5 text-primary hover:text-accent" aria-label="Decrease">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQty(item, 1)} className="px-3 py-1.5 text-primary hover:text-accent" aria-label="Increase">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatINR(price * item.quantity)}</p>
                        {price < product.originalPrice && (
                          <p className="text-xs text-muted line-through">{formatINR(product.originalPrice * item.quantity)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <Link to="/shop" className="text-sm font-medium text-accent hover:underline">← Continue shopping</Link>
            </div>
          </div>

          {/* Summary */}
          <div className="h-fit lg:sticky lg:top-24">
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-primary">Order Summary</h2>

              {totals.subtotal < freeThreshold && (
                <div className="mt-4 rounded-xl bg-light p-3">
                  <p className="text-xs text-ink/70">
                    Add {formatINR(freeThreshold - totals.subtotal)} more for <span className="font-semibold text-primary">FREE delivery</span> 🚚
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium text-primary">{formatINR(totals.subtotal)}</span>
                </div>

                {totals.discount > 0 ? (
                  <div className="flex justify-between text-emerald-600">
                    <span>{totals.discountLabel} ✅</span>
                    <span className="font-semibold">− {formatINR(totals.discount)}</span>
                  </div>
                ) : (
                  <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700">
                    Buy 2 items for 5% off, or 3+ for 10% off 🎉
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted">Delivery</span>
                  <span className="font-medium text-primary">{totals.delivery === 0 ? 'FREE' : formatINR(totals.delivery)}</span>
                </div>

                <div className="flex justify-between border-t border-line pt-3 text-base font-bold text-primary">
                  <span>Total</span>
                  <span>{formatINR(totals.total)}</span>
                </div>
              </div>

              <Button variant="accent" size="block" className="mt-6" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>
              <p className="mt-3 text-center text-[11px] text-muted">🔒 100% secure checkout · Easy returns within 7 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}