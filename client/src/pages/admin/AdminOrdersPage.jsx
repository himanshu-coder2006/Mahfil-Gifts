import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getOrders, getSettings } from '../../utils/storage';
import { showNotification } from '../../store/slices/notificationSlice';
import { formatINR } from '../../utils/format';
import { StatusPill } from './AdminDashboardPage';
import Modal from '../../components/ui/Modal';

const STATUS_OPTIONS = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

export default function AdminOrdersPage() {
  const dispatch = useDispatch();
  const settings = getSettings();
  const [orders, setOrdersState] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let local = getOrders();
    if (local.length === 0) {
      // Nothing seeded yet; leave empty so real orders show cleanly.
      local = [];
    }
    setOrdersState(local);
  }, []);

  const updateStatus = (orderId, status) => {
    const next = orders.map((o) => (o.orderId === orderId ? { ...o, status } : o));
    localStorage.setItem('gt_orders', JSON.stringify(next));
    setOrdersState(next);
    dispatch(showNotification({ message: `Order marked as ${status}.` }));
  };

  const tabs = useMemo(() => {
    const set = new Set(orders.map((o) => o.status || 'Processing'));
    return ['All', ...STATUS_OPTIONS.filter((s) => set.has(s))];
  }, [orders]);

  const filtered = filter === 'All' ? orders : orders.filter((o) => (o.status || 'Processing') === filter);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary">Orders</h1>
      <p className="mt-1 text-sm text-muted">Manage and update order statuses.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filter === t ? 'bg-primary text-white' : 'bg-white text-muted hover:text-primary'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-4xl">📦</p>
            <p className="mt-3 font-display text-lg font-semibold text-primary">No orders here</p>
            <p className="mt-1 text-sm text-muted">Orders placed on the storefront will appear here.</p>
            <p className="mt-2 text-xs text-muted">{settings.storeName} · Free shipping above {formatINR(settings.freeShippingThreshold)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] tracking-wider text-muted uppercase">
                  <th className="pb-2 font-semibold">Order ID</th>
                  <th className="pb-2 font-semibold">Customer</th>
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Items</th>
                  <th className="pb-2 font-semibold">Total</th>
                  <th className="pb-2 font-semibold">Payment</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.orderId} className="border-b border-line/60 hover:bg-light/60">
                    <td className="py-3">
                      <button className="font-mono text-xs text-accent hover:underline" onClick={() => setSelected(o)}>
                        {String(o.orderId).slice(0, 18)}
                      </button>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-primary">{o.customer?.name || '—'}</p>
                      <p className="text-xs text-muted">{o.customer?.phone}</p>
                    </td>
                    <td className="py-3 text-muted">{new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="py-3 text-ink/80">{o.items?.length}</td>
                    <td className="py-3 font-semibold text-primary">{formatINR(o.total)}</td>
                    <td className="py-3 text-ink/70">{o.paymentMethod}</td>
                    <td className="py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.orderId, e.target.value)}
                        className="rounded-full border border-line bg-white px-2 py-1 text-xs font-medium text-ink outline-none focus:border-accent"
                      >
                        <option value="">Select</option>
                        {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order ${selected ? String(selected.orderId).slice(0, 18) : ''}`}>
        {selected && (
          <div>
            <div className="flex items-center justify-between">
              <StatusPill status={selected.status} />
              <span className="text-xs text-muted">{new Date(selected.date).toLocaleString('en-IN')}</span>
            </div>

            <div className="mt-4 rounded-xl bg-light p-4">
              <p className="text-sm font-semibold text-primary">{selected.customer?.name}</p>
              <p className="text-xs text-muted">{selected.customer?.phone} · {selected.customer?.email}</p>
              <p className="mt-2 text-xs text-ink/70">
                {selected.address?.addressLine1 ? `${selected.address.addressLine1}, ` : ''}
                {selected.address?.addressLine2 ? `${selected.address.addressLine2}, ` : ''}
                {selected.address?.city || ''} {selected.address?.state || ''} - {selected.address?.pincode || ''}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {selected.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-sm">
                  <p className="line-clamp-1 text-ink/80">
                    <span className="text-muted">{item.quantity}×</span> {item.name}
                    {item.personalised ? <span className="text-accent"> (”{item.personalised}”)</span> : ''}
                  </p>
                  <p className="shrink-0 font-medium text-primary">{formatINR(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatINR(selected.subtotal)}</span></div>
              {selected.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {formatINR(selected.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{selected.delivery === 0 ? 'FREE' : formatINR(selected.delivery)}</span></div>
              {selected.codFee > 0 && <div className="flex justify-between"><span className="text-muted">COD charge</span><span>{formatINR(selected.codFee)}</span></div>}
              <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-primary"><span>Total</span><span>{formatINR(selected.total)}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}