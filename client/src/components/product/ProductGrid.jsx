import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, cols }) {
  if (!products?.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-4xl">🕊️</p>
        <p className="mt-3 font-display text-lg text-primary">No products match your filters.</p>
        <p className="mt-1 text-sm text-muted">Try adjusting the filters or browse all gifts.</p>
      </div>
    );
  }
  return (
    <div className={`stagger grid gap-x-4 gap-y-8 sm:grid-cols-2 ${cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}