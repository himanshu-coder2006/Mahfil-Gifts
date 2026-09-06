import React from 'react';
import { X } from 'lucide-react';

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹999', min: 500, max: 999 },
  { label: '₹1,000 – ₹1,499', min: 1000, max: 1499 },
  { label: 'Above ₹1,500', min: 1500, max: null },
];

const GENDERS = [
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'kids', label: 'Kids' },
];

const TAG_OPTIONS = [
  { id: 'gift-set', label: 'Gift Sets' },
  { id: 'box-bag', label: 'Box Bags' },
  { id: 'tote', label: 'Totes' },
  { id: 'pouch', label: 'Pouches' },
  { id: 'wallet', label: 'Wallets' },
  { id: 'mug', label: 'Mugs' },
  { id: 'personalised', label: 'Personalised' },
];

export default function ProductFilters({ state, set, onClear, counts }) {
  const update = (key, value) => set(key, value);

  const activeCount = [
    state.category, state.gender, state.tag, state.price, state.sale, state.newArrival, state.bestseller,
  ].filter(Boolean).length;

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Filters</h3>
        {activeCount > 0 && (
          <button onClick={onClear} className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <p className="mb-2.5 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">Category</p>
        <div className="space-y-1.5">
          {counts.categories.map((c) => (
            <label key={c._id} className="flex cursor-pointer items-center gap-2 text-sm text-ink/80 hover:text-primary">
              <input
                type="radio"
                name="category"
                checked={state.category === c.slug}
                onChange={() => update('category', c.slug)}
                className="h-3.5 w-3.5 accent-[#E94560]"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <p className="mb-2.5 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">For</p>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.id}
              onClick={() => update('gender', state.gender === g.id ? '' : g.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                state.gender === g.id ? 'border-accent bg-accent text-white' : 'border-line bg-white text-ink/70 hover:border-primary'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <p className="mb-2.5 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">Type</p>
        <div className="space-y-1.5">
          {TAG_OPTIONS.map((t) => (
            <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm text-ink/80 hover:text-primary">
              <input
                type="checkbox"
                checked={state.tag === t.id}
                onChange={() => update('tag', state.tag === t.id ? '' : t.id)}
                className="h-3.5 w-3.5 accent-[#E94560]"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="mb-2.5 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">Price</p>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className="flex cursor-pointer items-center gap-2 text-sm text-ink/80 hover:text-primary">
              <input
                type="radio"
                name="price"
                checked={state.price === r.label}
                onChange={() => update('price', r.label)}
                className="h-3.5 w-3.5 accent-[#E94560]"
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div>
        <p className="mb-2.5 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">Pick</p>
        <div className="space-y-1.5">
          {[
            { key: 'sale', label: '🔥 On Sale' },
            { key: 'newArrival', label: '✨ New Arrivals' },
            { key: 'bestseller', label: '⭐ Bestsellers' },
          ].map((f) => (
            <label key={f.key} className="flex cursor-pointer items-center gap-2 text-sm text-ink/80 hover:text-primary">
              <input
                type="checkbox"
                checked={!!state[f.key]}
                onChange={() => update(f.key, state[f.key] ? '' : true)}
                className="h-3.5 w-3.5 accent-[#E94560]"
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}