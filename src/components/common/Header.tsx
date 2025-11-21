'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import PhoneCTA from './PhoneCTA';

const DEFAULT_PHONE_NUMBER = '+82-00-0000-0000';

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();
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
        console.error('[HOTLINE] Header fetch error:', error);
      }
    };

    fetchHotline();
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-primary/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-white grid place-content-center font-bold">
              JP
            </div>
            <strong className="text-lg">JP Haven</strong>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/cemeteries"
            className={`hover:underline ${
              pathname?.includes('/cemeteries') ? 'font-semibold' : ''
            }`}
          >
            {t('nav.cemeteries')}
          </Link>
          <Link
            href="/process"
            className={`hover:underline ${
              pathname?.includes('/process') ? 'font-semibold' : ''
            }`}
          >
            {t('nav.process')}
          </Link>
          <Link
            href="/contact"
            className={`hover:underline ${
              pathname?.includes('/contact') ? 'font-semibold' : ''
            }`}
          >
            {t('nav.contact')}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <PhoneCTA phone={phone} className="hidden sm:inline-flex" />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

