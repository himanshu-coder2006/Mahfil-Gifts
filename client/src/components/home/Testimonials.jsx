import React from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Ananya Sharma',
    date: '12 Aug 2026',
    product: 'Customized Floral Printed Box Bag',
    rating: 5,
    text: 'The floral box bag looks even prettier in person. The name embossing is crisp and elegant. Gifting it to my sister — she is going to love it!',
  },
  {
    name: 'Rohit Verma',
    date: '2 Sep 2026',
    product: 'Personalised Name Engraved Leather Wallet',
    rating: 5,
    text: 'Excellent leather quality and the personalisation is perfect. Delivery was quick and packaging was premium. Highly recommended for gifting.',
  },
  {
    name: 'Priya Patel',
    date: '28 Aug 2026',
    product: 'Personalised Photo Ceramic Mug',
    rating: 4,
    text: 'Photo quality on the mug is sharp and colours are vibrant. It has become my dad\'s favourite mug. Will order again for more family members.',
  },
];

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= n ? 'fill-gold text-gold' : 'fill-line text-line'}`} />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="mb-8 text-center">
        <p className="section-eyebrow">Real stories</p>
        <h2 className="section-title">Loved by Our Customers</h2>
        <div className="section-underline mx-auto" />
      </div>
      <div className="stagger grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="card p-6">
            <Stars n={t.rating} />
            <p className="mt-4 text-sm leading-relaxed text-ink/80">"{t.text}"</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-sm font-semibold text-primary">{t.name}</p>
              <p className="text-xs text-muted">{t.date} · {t.product}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}