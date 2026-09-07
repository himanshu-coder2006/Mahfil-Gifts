import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`anim-fade-up relative max-h-[90vh] w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} overflow-hidden rounded-2xl bg-white shadow-2xl`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h3 className="font-display text-lg font-bold text-primary">{title}</h3>
            <button onClick={onClose} className="text-muted hover:text-accent" aria-label="Close">
              ✕
            </button>
          </div>
        )}
        <div className="max-h-[calc(90vh-70px)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}