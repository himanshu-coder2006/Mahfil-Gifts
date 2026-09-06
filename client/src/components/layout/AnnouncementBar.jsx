import React, { useEffect, useState } from 'react';
import { getSettings } from '../../utils/storage';

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const settings = getSettings();
  const messages = settings.announcements?.length ? settings.announcements : ['Welcome to GiftedThreads'];

  useEffect(() => {
    if (messages.length < 2) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), 3000);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className="relative z-50 overflow-hidden bg-primary text-center text-[11px] font-medium tracking-wide text-white">
      <div className="h-8">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`absolute inset-x-0 flex h-8 items-center justify-center transition-all duration-500 ${
              i === index ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
          >
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}