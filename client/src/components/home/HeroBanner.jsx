import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const HERO_IMAGE = '/7f65389a-e9a8-4e11-b12e-e9874c3c4790-removebg-preview.png';

export default function HeroBanner({ heroProduct }) {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl min-h-[70vh] items-center gap-10 px-4 py-12 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="anim-fade-up">
          <Badge variant="accent" className="!px-3 !py-1">Personalised Gifting Studio</Badge>
          <h1 className="mt-5 max-w-xl font-display text-4xl leading-[1.05] font-bold text-primary sm:text-5xl lg:text-7xl">
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

        <div className="anim-fade-up relative flex min-h-[22rem] items-center justify-center lg:min-h-[30rem]">
          <div className="hero-stage relative w-full max-w-md">
            <div className="hero-glow absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />
            {heroProduct ? (
              <Link to="/shop" className="group relative z-10 block overflow-hidden rounded-[2rem]">
                <img
                  src={HERO_IMAGE}
                  alt="Orange teddy bear gift"
                  className="hero-teddy aspect-[4/5] w-full object-contain mix-blend-multiply"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = '/teddy-hero.svg';
                  }}
                />
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