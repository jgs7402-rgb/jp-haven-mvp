'use client';

import { useEffect, useState } from 'react';
import PhoneCTA from './PhoneCTA';

const DEFAULT_PHONE_NUMBER = '+82-00-0000-0000';

export default function HeroPhoneCTA() {
  const [phone, setPhone] = useState(DEFAULT_PHONE_NUMBER);

  useEffect(() => {
    const fetchHotline = async () => {
      try {
        const res = await fetch('/api/hotline');
        if (!res.ok) return;
        const data = await res.json();
        if (data.phone) {
          setPhone(data.phone);
        }
      } catch (error) {
        console.error('[HOTLINE] Hero fetch error:', error);
      }
    };

    fetchHotline();
  }, []);

  return <PhoneCTA phone={phone} />;
}


