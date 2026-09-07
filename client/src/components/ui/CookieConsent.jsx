import React, { useState } from 'react';
import { hasConsentedCookie, acceptCookie } from '../../utils/storage';
import Button from './Button';

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => !hasConsentedCookie());

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[65] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl bg-primary p-5 text-white shadow-2xl">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm leading-snug">
          🍪 We use cookies to improve your shopping experience. By continuing, you agree to our
          policies.
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="accent"
            onClick={() => {
              acceptCookie();
              setVisible(false);
            }}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}