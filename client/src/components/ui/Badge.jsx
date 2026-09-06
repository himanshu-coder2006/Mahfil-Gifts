import React from 'react';

const STYLES = {
  accent: 'bg-accent text-white',
  navy: 'bg-primary text-white',
  light: 'bg-light text-primary border border-line',
  green: 'bg-emerald-600 text-white',
  gold: 'bg-gold text-white',
};

export default function Badge({ children, variant = 'accent', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}