import React from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductGrid from '../product/ProductGrid';

const PRICE_LINKS = [
  ['Under Rs. 500', '/shop?maxPrice=500'],
  ['Under Rs. 999', '/shop?maxPrice=999'],
  ['Under Rs. 1,499', '/shop?maxPrice=1499'],
  ['Bestsellers', '/shop?bestseller=true'],
];

export default function HomeCatalog({ products = [], categories = [] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Curated for you</p>
          <h2 className="section-title">Shop the collection</h2>
          <div className="section-underline" />
        </div>
        <Link to="/shop" className="hidden text-sm font-semibold text-accent hover:underline sm:block">View all products -&gt;</Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-xl border border-line bg-white p-5 shadow-[0_2px_8px_rgba(24,35,31,0.08)] lg:block">
          <Link to="/shop" className="flex items-center gap-2 rounded-full border border-line bg-light px-3 py-2 text-xs text-muted transition hover:border-accent hover:text-accent">
            <Search className="h-3.5 w-3.5" />
            <span>Find a gift</span>
          </Link>

          <div className="mt-7">
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Categories</p>
            <div className="space-y-2.5">
              {categories.slice(0, 7).map((category) => (
                <Link key={category._id} to={`/shop?category=${category.slug}`} className="block text-xs text-muted transition hover:text-accent">
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-7 border-t border-line pt-6">
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Price</p>
            <div className="space-y-2.5">
              {PRICE_LINKS.map(([label, href]) => (
                <Link key={label} to={href} className="block text-xs text-muted transition hover:text-accent">{label}</Link>
              ))}
            </div>
          </div>

          <div className="mt-7 rounded-lg bg-primary p-4 text-white shadow-sm">
            <SlidersHorizontal className="h-5 w-5 text-accent" />
            <p className="mt-3 font-display text-lg font-bold">Made to feel personal.</p>
            <p className="mt-1 text-xs leading-relaxed text-white/60">Names, initials and thoughtful details for every kind of celebration.</p>
            <Link to="/shop?tag=personalised" className="mt-4 inline-block text-xs font-semibold text-accent hover:underline">Shop personalised -&gt;</Link>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold text-primary">New products</h3>
            <Link to="/shop?newArrival=true" className="text-xs font-semibold text-accent hover:underline">View all -&gt;</Link>
          </div>
          <ProductGrid products={products.slice(0, 4)} cols={4} />

          <div className="mt-16 mb-5 flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold text-primary">Best sellers</h3>
            <Link to="/shop?bestseller=true" className="text-xs font-semibold text-accent hover:underline">View all -&gt;</Link>
          </div>
          <ProductGrid products={products.slice(4, 8).length ? products.slice(4, 8) : products.slice(0, 4)} cols={4} />
        </div>
      </div>
    </section>
  );
}
