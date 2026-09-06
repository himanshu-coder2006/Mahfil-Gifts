import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { getOrders, getSettings } from '../utils/storage';
import { formatINR } from '../utils/format';
import { computeCartTotals } from '../utils/order';
import Button from '../components/ui/Button';

const CONFETTI_COLORS = ['#E94560', '#1A1A2E', '#C9A227', '#2E7D72', '#F8C8D4', '#8B5CF6'];
const CONFETTI_COUNT = 26;

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
        const left = `${(i * 137.5) % 100}%`;
        const delay = `${(i % 10) * 0.5}s`;
        const duration = `${3 + (i % 4)}s`;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const size = 6 + (i % 6);
        return (
          <span
            key={i}
            className="anim-confetti rounded-sm"
            style={{ left, backgroundColor: color, width: size, height: size * 1.6, animationDelay: delay, animationDuration: duration }}
          />
        );
      })}
    </div>
  );
}

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mirror = getOrders().find((o) => o.orderId === id);
    setOrder(mirror || null);
    orderAPI
      .getOne(id)
      .then((res) => {
        // Prefer the local mirror (has accurate discounts); fall back to server data.
        setOrder((prev) => prev || convertServerOrder(res.data));
      })
      .catch(() => {
        if (!mirror) {
          // Fall back to computing from server-independent data if nothing found.
          setOrder(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const convertServerOrder = (o) => {
    if (!o) return null;
    const items = (o.orderItems || []).map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, personalised: i.variant?.personalisation || '' }));
    const t = computeCartTotals(items.map((i) => ({ product: { price: i.price }, quantity: i.quantity })));
    return {
      orderId: o._id,
      date: o.createdAt,
      customer: { name: o.shippingAddress?.fullName, email: '', phone: o.shippingAddress?.phone },
      items,
      address: o.shippingAddress,
      paymentMethod: o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
      subtotal: o.subtotal, discount: o.discount, delivery: o.shippingCharge, total: o.totalAmount,
      status: o.orderStatus || 'Processing',
    };
  };

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted">Loading your order…</div>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-4xl">🧐</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-primary">Order not found</h1>
        <Link to="/account" className="mt-6 inline-block"><Button variant="accent">My Orders</Button></Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <Confetti />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6">
        <div className="anim-check mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-5xl text-emerald-600">✅</div>
        <h1 className="mt-6 font-display text-3xl font-bold text-primary md:text-4xl">Order Placed Successfully!</h1>
        <p className="mt-3 text-muted">Thank you, {order.customer?.name?.split(' ')[0]} 🎉 Your order is now being prepared with love.</p>
        <p className="mt-2 text-sm text-ink/70">A confirmation email will be sent to <span className="font-semibold text-primary">{order.customer?.email || order.address?.email || 'your email'}</span>.</p>

        <div className="mx-auto mt-6 inline-block rounded-full bg-light px-5 py-2 text-sm">
          <span className="text-muted">Order ID: </span>
          <span className="font-mono font-semibold text-primary">{order.orderId}</span>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link to="/account"><Button variant="primary">Track Order</Button></Link>
          <Link to="/shop"><Button variant="outline">Continue Shopping</Button></Link>
        </div>

        {/* Order summary */}
        <div className="mt-10 rounded-2xl bg-white p-6 text-left shadow-sm">
          <h2 className="font-display text-lg font-bold text-primary">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-muted">Qty {item.quantity}{item.personalised ? ` · “${item.personalised}”` : ''}</p>
                </div>
                <p className="text-sm font-semibold text-primary">{formatINR(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {formatINR(order.discount)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{order.delivery === 0 ? 'FREE' : formatINR(order.delivery)}</span></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-primary"><span>Total Paid</span><span>{formatINR(order.total)}</span></div>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-4 text-sm">
            <div>
              <p className="text-xs text-muted">Delivering to</p>
              <p className="mt-1 text-ink/80">
                {order.address?.fullName || order.customer?.name}
                {order.address?.addressLine1 ? `, ${order.address.addressLine1}` : ''}
                {order.address?.city ? `, ${order.address.city}` : ''}
                {order.address?.pincode ? ` - ${order.address.pincode}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Payment</p>
              <p className="mt-1 text-ink/80">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Status</p>
              <p className="mt-1 text-emerald-600">{order.status || 'Processing'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}