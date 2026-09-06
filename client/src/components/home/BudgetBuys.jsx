import React from 'react';
import { Link } from 'react-router-dom';

const TILES = [
  { label: 'Under ₹499', price: 499, max: 499, bg: '#E94560', emoji: '🎁' },
  { label: 'Under ₹999', price: 999, max: 999, bg: '#1A1A2E', emoji: '💝' },
  { label: 'Under ₹1,299', price: 1299, max: 1299, bg: '#C9A227', emoji: '✨' },
  { label: 'Under ₹1,499', price: 1499, max: 1499, bg: '#2E7D72', emoji: '🌿' },
];

export default function BudgetBuys() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="mb-8 text-center">
        <p className="section-eyebrow">Great on a budget</p>
        <h2 className="section-title">Budget Buys</h2>
        <div className="section-underline mx-auto" />
        <p className="mt-3 text-sm text-muted">Thoughtful gifts without the price tag.</p>
      </div>
      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((t) => (
          <Link
            key={t.label}
            to={`/shop?maxPrice=${t.max}`}
            className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-md transition hover:-translate-y-1"
            style={{ backgroundColor: t.bg }}
          >
            <span className="absolute -top-2 -right-2 text-6xl opacity-20 transition group-hover:scale-110">{t.emoji}</span>
            <p className="text-sm text-white/80">Gifts</p>
            <p className="mt-1 font-display text-3xl font-bold">{t.label}</p>
            <p className="mt-1 text-xs text-white/70">Starting at ₹{t.price}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium underline decoration-2 underline-offset-4">
              Shop Now →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}