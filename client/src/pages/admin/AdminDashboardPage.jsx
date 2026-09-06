import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, getAdminProducts, getCustomers } from '../../utils/storage';
import { formatINR } from '../../utils/format';

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    setOrders(getOrders());
    setProducts(getAdminProducts());
    setCustomers(getCustomers());
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    const validCustomers = customers.filter((c) => (c.email || '').toLowerCase().includes('@'));
    return {
      revenue,
      orders: orders.length,
      products: products.length,
      customers: validCustomers.length,
    };
  }, [orders, products, customers]);

  const weekly = useMemo(() => {
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return { label: DAY[d.getDay()], count: 0, date: d };
    });
    orders.forEach((o) => {
      const od = new Date(o.date || o.createdAt).toDateString();
      const b = buckets.find((x) => x.date.toDateString() === od);
      if (b) b.count += 1;
    });
    const max = Math.max(1, ...buckets.map((b) => b.count));
    return { buckets, max };
  }, [orders]);

  const byCategory = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const name = p.category?.name || p.categoryName || 'Uncategorised';
      map[name] = (map[name] || 0) + Number(p.price || 0) * Number(p.stock || 0);
    });
    const list = Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const maxValue = Math.max(1, ...list.map((l) => l.value));
    return { list, maxValue };
  }, [products]);

  const recent = orders.slice(0, 5);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">A quick snapshot of your gift store.</p>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatINR(stats.revenue)} accent="bg-emerald-100 text-emerald-700" icon="₹" />
        <StatCard label="Total Orders" value={stats.orders} accent="bg-sky-100 text-sky-700" icon="📦" />
        <StatCard label="Products" value={stats.products} accent="bg-amber-100 text-amber-700" icon="🎁" />
        <StatCard label="Customers" value={stats.customers} accent="bg-accent/10 text-accent" icon="👥" />
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-primary">Orders · Last 7 Days</h2>
          <div className="mt-6 flex h-44 items-end justify-around gap-3">
            {weekly.buckets.map((b, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-primary">{b.count}</span>
                <div className="w-full max-w-12 rounded-t-lg bg-accent transition-all" style={{ height: `${(b.count / weekly.max) * 100}%`, minHeight: b.count ? '6px' : '2px', background: b.count ? '' : '#e9e4dc' }} />
                <span className="text-[10px] text-muted">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-primary">Inventory Value by Category</h2>
          <div className="mt-6 space-y-4">
            {byCategory.list.slice(0, 6).map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-ink/80">{c.name}</span>
                  <span className="text-muted">{formatINR(c.value)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-light">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(c.value / byCategory.maxValue) * 100}%` }} />
                </div>
              </div>
            ))}
            {byCategory.list.length === 0 && <p className="text-sm text-muted">Add products to see this chart.</p>}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-primary">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-accent hover:underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No orders yet. Orders placed through the storefront will appear here.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] tracking-wider text-muted uppercase">
                  <th className="pb-2 font-semibold">Order ID</th>
                  <th className="pb-2 font-semibold">Customer</th>
                  <th className="pb-2 font-semibold">Items</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.orderId || o._id} className="border-b border-line/60">
                    <td className="py-3 font-mono text-xs text-primary">{String(o.orderId || o._id).slice(0, 16)}</td>
                    <td className="py-3 font-medium text-ink/80">{o.customer?.name || '—'}</td>
                    <td className="py-3 text-ink/80">{(o.items || o.orderItems || []).length}</td>
                    <td className="py-3 font-semibold text-primary">{formatINR(o.total || o.totalAmount)}</td>
                    <td className="py-3"><StatusPill status={o.status || o.orderStatus || 'Processing'} /></td>
                    <td className="py-3 text-muted">{new Date(o.date || o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, icon }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${accent}`}>{icon}</div>
      <p className="mt-4 font-display text-2xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

export function StatusPill({ status }) {
  const colors = {
    Processing: 'bg-amber-100 text-amber-700',
    Shipped: 'bg-sky-100 text-sky-700',
    Delivered: 'bg-emerald-100 text-emerald-700',
    Cancelled: 'bg-accent/10 text-accent',
    Confirmed: 'bg-indigo-100 text-indigo-700',
    Pending: 'bg-line text-ink/70',
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || colors.Processing}`}>{status}</span>;
}