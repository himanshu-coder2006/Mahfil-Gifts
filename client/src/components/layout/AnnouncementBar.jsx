import React from 'react';
import { getSettings } from '../../utils/storage';

export default function AnnouncementBar() {
  const settings = getSettings();
  const messages = settings.announcements?.length ? settings.announcements : ['Welcome to MahfilGifts'];
  const ticker = messages.length > 1 ? messages.join('   •   ') : `${messages[0]}   •   Free delivery across India   •   Personalised gifts made with care`;

  return (
    <div className="relative z-50 overflow-hidden bg-primary text-[11px] font-medium tracking-wide text-white">
      <div className="announcement-marquee flex min-w-max items-center gap-12 whitespace-nowrap py-2">
        <span>{ticker}</span>
        <span aria-hidden="true">{ticker}</span>
      </div>
    </div>
  );
}