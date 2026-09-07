import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dismissToast } from '../../store/slices/notificationSlice';

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, toast.duration || 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const icon =
    toast.type === 'error' ? (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">!</span>
    ) : toast.type === 'cart' ? (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">✓</span>
    ) : (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs text-accent">✓</span>
    );

  return (
    <div className="anim-toast pointer-events-auto flex w-80 items-start gap-3 rounded-xl bg-primary p-4 text-white shadow-2xl">
      {icon}
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      <button onClick={onClose} className="text-white/50 hover:text-white" aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}

export default function ToastStack() {
  const toasts = useSelector((s) => s.notification.toasts);
  const dispatch = useDispatch();

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed top-20 right-4 z-[90] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => dispatch(dismissToast(t.id))} />
      ))}
    </div>
  );
}