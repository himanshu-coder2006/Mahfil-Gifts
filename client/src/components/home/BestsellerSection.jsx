import React from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../product/ProductGrid';

export default function BestsellerSection({ products = [] }) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Loved by thousands</p>
          <h2 className="section-title">Our Bestsellers</h2>
          <div className="section-underline" />
        </div>
        <Link to="/shop?bestseller=true" className="text-sm font-medium text-accent hover:underline">View all →</Link>
      </div>
      <ProductGrid products={products.slice(0, 8)} />
    </section>
  );
}