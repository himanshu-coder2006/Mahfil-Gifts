import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Heart } from 'lucide-react';
import { newsletterAPI } from '../../services/api';
import { showNotification } from '../../store/slices/notificationSlice';
import Button from '../ui/Button';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      dispatch(showNotification({ message: 'Please enter a valid email address.', type: 'error' }));
      return;
    }
    newsletterAPI
      .subscribe(email)
      .then(() => {
        dispatch(showNotification({ message: 'Welcome aboard! Your 10% off code is on its way. 🎉' }));
        setEmail('');
      })
      .catch((err) => dispatch(showNotification({ message: err.message || 'Subscription failed.', type: 'error' })));
  };

  return (
    <section className="relative min-h-[24rem] overflow-hidden bg-[#f4e6dc]">
      <img
        src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=2000&q=90"
        alt="Wrapped gifts with warm lights"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#f8f3ed]/80" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 text-center text-primary md:px-6">
        <span className="mx-auto flex h-10 w-10 items-center justify-center bg-white/80 text-accent shadow-sm">
          <Heart className="h-4 w-4 fill-accent" />
        </span>
        <h2 className="mt-5 font-display text-3xl font-bold md:text-5xl">Get <span className="text-accent">10% off</span> your first order</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink/75">
          Join the MahfilGifts newsletter for exclusive deals, new drops and personalised gifting ideas.
        </p>
        <form onSubmit={submit} className="mx-auto mt-7 flex max-w-[26rem] flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 rounded-full border border-primary/25 bg-white/70 px-5 py-3 text-sm text-primary outline-none placeholder:text-muted focus:border-accent"
          />
          <Button type="submit" size="lg" className="!bg-primary hover:!bg-primary-light">Subscribe</Button>
        </form>
        <p className="mt-3 text-xs text-muted">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}