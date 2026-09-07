import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
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
    <section className="bg-gradient-to-r from-accent via-accent-dark to-accent">
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-white md:px-6">
        <p className="text-4xl">💌</p>
        <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Get 10% off your first order</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/80">
          Join the GiftedThreads newsletter for exclusive deals, new drops and personalised gifting ideas.
        </p>
        <form onSubmit={submit} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 rounded-full border border-white/40 bg-white/15 px-5 py-3 text-sm text-white outline-none placeholder:text-white/60 focus:bg-white/20"
          />
          <Button type="submit" size="lg" className="!bg-primary hover:!bg-primary-light">Subscribe</Button>
        </form>
        <p className="mt-3 text-xs text-white/60">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}