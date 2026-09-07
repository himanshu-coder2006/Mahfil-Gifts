import React from 'react';
import { Link } from 'react-router-dom';

const OVERRIDES = {
  'bags-totes': { label: 'Bags', emoji: '👜' },
  'wallets-pouches': { label: 'Wallets & Pouches', emoji: '👛' },
  drinkware: { label: 'Drinkware', emoji: '☕' },
  'home-decor': { label: 'Home Decor', emoji: '🕯️' },
  jewellery: { label: 'Jewellery', emoji: '💍' },
  kids: { label: 'Kids', emoji: '🧸' },
  travel: { label: 'Travel', emoji: '✈️' },
  'personalised-gifts': { label: 'Personalised', emoji: '🎁' },
};

export default function CategoryGrid({ categories }) {
  if (!categories?.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="mb-8 text-center">
        <p className="section-eyebrow">Shop by category</p>
        <h2 className="section-title">Find the Perfect Gift</h2>
        <div className="section-underline mx-auto" />
      </div>
      <div className="stagger grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.slice(0, 6).map((c) => {
          const meta = OVERRIDES[c.slug] || {};
          return (
            <Link key={c._id} to={`/shop?category=${c.slug}`} className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-[4/5] w-full overflow-hidden">
                <img src={c.image} alt={c.name} className="img-zoom h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent transition group-hover:from-primary/90" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                <div>
                  <p className="text-lg">{meta.emoji ?? '🎁'}</p>
                  <p className="font-display text-lg font-bold text-white">{meta.label || c.name}</p>
                </div>
                <span className="text-sm text-white/80 opacity-0 transition group-hover:opacity-100">Shop →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}