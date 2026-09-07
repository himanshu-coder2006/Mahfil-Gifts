import React, { useEffect, useMemo, useState } from 'react';
import { getOrders, getCustomers, SEED_CUSTOMERS } from '../../utils/storage';
import { formatINR } from '../../utils/format';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let stored = getCustomers();
    if (stored.length === 0) {
      stored = SEED_CUSTOMERS;
      localStorage.setItem('gt_customers', JSON.stringify(stored));
    }
    const orders = getOrders();
    const withOrders = stored.map((c) => {
      const mine = orders.filter((o) => o.customer?.email === c.email);
      return mine.length
        ? { ...c, orders: mine.reduce((s, o) => s + 1, 0), spent: mine.reduce((s, o) => s + o.total, mySpent(c, stored)) }
        : c;
    });
    setCustomers(withOrders);
  }, []);

  // helper to preserve seed spent when no new orders match
  function mySpent(c, all) {
    const seed = all.find((x) => x.email === c.email);
    return seed?.spent || 0;
  }

  const totals = useMemo(() => {
    const totalSpent = customers.reduce((s, c) => s + (c.spent || 0), 0);
    const totalOrders = customers.reduce((s, c) => s + (c.orders || 0), 0);
    return { totalSpent, totalOrders };
  }, [customers]);

  const filtered = customers.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Customers</h1>
          <p className="mt-1 text-sm text-muted">{customers.length} customers · {totals.totalOrders} orders · {formatINR(totals.totalSpent)} lifetime value</p>
        </div>
        <input className="field max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" />
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] tracking-wider text-muted uppercase">
                <th className="pb-2 font-semibold">Customer</th>
                <th className="pb-2 font-semibold">Contact</th>
                <th className="pb-2 font-semibold">Orders</th>
                <th className="pb-2 font-semibold">Total Spent</th>
                <th className="pb-2 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.email} className="border-b border-line/60">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                        {(c.name || '?')[0]}
                      </span>
                      <p className="font-medium text-primary">{c.name}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <p className="text-ink/80">{c.email}</p>
                    <p className="text-xs text-muted">{c.phone}</p>
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-light px-2.5 py-1 text-xs font-semibold text-primary">{c.orders || 0}</span>
                  </td>
                  <td className="py-3 font-semibold text-primary">{formatINR(c.spent || 0)}</td>
                  <td className="py-3 text-muted">{c.joined || '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-muted">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}