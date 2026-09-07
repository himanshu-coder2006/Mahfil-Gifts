import React from 'react';

const VARIANTS = {
  primary: 'btn-primary',
  accent: 'btn-accent',
  outline: 'btn-outline',
  outlineLight: 'btn-outline-light',
  ghost: 'btn-ghost',
};

const SIZES = {
  sm: 'px-4 py-2 text-xs rounded-full',
  md: 'px-6 py-2.5 text-sm rounded-full',
  lg: 'px-8 py-3.5 text-sm rounded-full',
  block: 'w-full px-6 py-3.5 text-sm rounded-full',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button className={`${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}