import React from 'react';

export default function BackToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-5 left-5 z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg text-white shadow-lg transition hover:bg-accent ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      ↑
    </button>
  );
}