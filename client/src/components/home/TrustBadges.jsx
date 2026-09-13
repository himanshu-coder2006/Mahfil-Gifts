import React from 'react';
import { MapPin, ShieldCheck, Star, Truck } from 'lucide-react';

const BADGES = [
  { Icon: ShieldCheck, title: 'Trusted by 15L+', sub: 'Happy customers across India', tone: 'bg-[#e7eee8]' },
  { Icon: Truck, title: '1 Lakh+ Pincodes', sub: 'Serving everywhere in India', tone: 'bg-[#f1e7dc]' },
  { Icon: MapPin, title: 'Made in India', sub: 'Proudly crafted locally', tone: 'bg-[#ece8df]' },
  { Icon: Star, title: '4.8/5 Rating', sub: 'On 2,000+ reviews', tone: 'bg-[#f4e5e1]' },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-line bg-card py-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 md:grid-cols-2 md:px-6 lg:grid-cols-4">
        {BADGES.map(({ Icon, ...b }) => (
          <div key={b.title} className={`flex items-center gap-3 rounded-xl px-4 py-4 ${b.tone}`}>
            <Icon className="h-7 w-7 shrink-0 text-accent" strokeWidth={1.8} />
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