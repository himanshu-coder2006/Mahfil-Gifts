import React from 'react';

const BADGES = [
  { emoji: '✅', title: 'Trusted by 15L+', sub: 'Happy customers across India' },
  { emoji: '🚚', title: '1 Lakh+ Pincodes', sub: 'Serving everywhere in India' },
  { emoji: '🇮🇳', title: 'Made in India', sub: 'Proudly crafted locally' },
  { emoji: '⭐', title: '4.8/5 Rating', sub: 'On 2,000+ reviews' },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-line bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:px-6 lg:grid-cols-4">
        {BADGES.map((b) => (
          <div key={b.title} className="flex items-center gap-3">
            <span className="text-3xl">{b.emoji}</span>
            <div>
              <p className="font-semibold text-primary">{b.title}</p>
              <p className="text-xs text-muted">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}