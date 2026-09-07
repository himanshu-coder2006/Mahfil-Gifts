import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function HeroBanner({ heroProduct }) {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl min-h-[90vh] items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-2">
        <div className="anim-fade-up">
          <Badge variant="accent" className="!px-3 !py-1">Personalised Gifting Studio</Badge>
          <h1 className="mt-5 font-display text-4xl leading-tight font-bold text-primary sm:text-5xl lg:text-6xl">
            Make Every Gift <span className="text-accent">Unforgettable</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70 sm:text-lg">
            Personalised bags, wallets, pouches and gift sets — made for them, made by you. Crafted with love in India.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop"><Button variant="accent" size="lg">Shop Now</Button></Link>
            <Link to="/shop?tag=personalised"><Button variant="outline" size="lg">Personalise Yours</Button></Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-ink/70">
            <p><span className="font-display text-2xl font-bold text-primary">15L+</span> Happy Customers</p>
            <p><span className="font-display text-2xl font-bold text-primary">4.8★</span> Average Rating</p>
          </div>
        </div>

        <div className="anim-fade-up relative hidden justify-center lg:flex">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-6 rounded-full bg-accent/10 blur-2xl" />
            {heroProduct ? (
              <Link to={`/product/${heroProduct.slug}`} className="group relative block overflow-hidden rounded-3xl shadow-2xl">
                <img src={heroProduct.thumbnail || heroProduct.images?.[0]} alt={heroProduct.name} className="img-zoom aspect-[4/5] w-full object-cover" />
                <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-4 py-3 backdrop-blur">
                  <p className="text-xs text-muted">{heroProduct.category?.name}</p>
                  <p className="font-semibold text-primary">{heroProduct.name}</p>
                </div>
              </Link>
            ) : (
              <div className="aspect-[4/5] w-full rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}