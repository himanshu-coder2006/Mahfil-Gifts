import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { newsletterAPI } from '../../services/api';
import { showNotification } from '../../store/slices/notificationSlice';

const COLS = [
  {
    title: 'Our Company',
    links: [
      ['About Us', '/shop?newArrival=true'],
      ['Contact Us', '/contact'],
      ['Reviews', '/'],
      ['Blog', '/'],
      ['Bestsellers', '/shop?bestseller=true'],
    ],
  },
  {
    title: 'Help',
    links: [
      ['Track Order', '/account'],
      ['Return Policy', '/'],
      ['Shipping Policy', '/'],
      ['Privacy Policy', '/'],
      ['FAQ', '/'],
    ],
  },
  {
    title: 'Work With Us',
    links: [
      ['Jobs', '/'],
      ['Corporate Gifting', '/'],
      ['Journal', '/'],
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();

  const subscribe = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      dispatch(showNotification({ message: 'Please enter a valid email address.', type: 'error' }));
      return;
    }
    newsletterAPI
      .subscribe(email)
      .then(() => {
        dispatch(showNotification({ message: 'Subscribed! Check your inbox for 10% off your first order.' }));
        setEmail('');
      })
      .catch((err) => dispatch(showNotification({ message: err.message || 'Subscription failed.', type: 'error' })));
  };

  return (
    <footer className="mt-16 bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 md:px-6">
        <div className="grid gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="font-display text-2xl font-bold">
              Gifted<span className="text-accent">Threads</span>
            </p>
            <p className="mt-2 text-sm text-white/60">Made for them. Made by you.</p>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Personalised bags, wallets, pouches and gift sets crafted with love for Men, Women and Kids — delivered across India.
            </p>
            <div className="mt-5 space-y-2 text-sm text-white/70">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> hello@giftedthreads.com</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> +91 99990 00000</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Made in India 🇮🇳</p>
            </div>
            <div className="mt-5 flex gap-3">
              {[{ Icon: Facebook, label: 'Facebook' }, { Icon: Instagram, label: 'Instagram' }, { Icon: Youtube, label: 'YouTube' }, { Icon: Twitter, label: 'Twitter' }].map(({ Icon, label }) => (
                <a key={label} href="/" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-accent hover:text-white">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[11px] font-semibold tracking-[0.2em] text-white/40 uppercase">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link to={href} className="text-sm text-white/70 transition hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <p className="mb-4 text-[11px] font-semibold tracking-[0.2em] text-white/40 uppercase">Newsletter</p>
            <p className="text-sm text-white/70">Get 10% off your first order & hear about new drops.</p>
            <form onSubmit={subscribe} className="mt-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-accent"
              />
              <button type="submit" className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-sm font-medium transition hover:bg-accent-dark">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-white/50">© 2026 GiftedThreads. All rights reserved.</p>
          <p className="text-xs text-white/50">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}