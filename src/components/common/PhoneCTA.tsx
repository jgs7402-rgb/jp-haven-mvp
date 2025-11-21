'use client';

import { useTranslations } from 'next-intl';

interface PhoneCTAProps {
  phone: string;
  className?: string;
  variant?: 'default' | 'outline';
}

export default function PhoneCTA({
  phone,
  className = '',
  variant = 'default',
}: PhoneCTAProps) {
  const t = useTranslations();
  const telLink = `tel:${phone.replace(/-/g, '').replace(/\+/g, '')}`;

  const baseClasses =
    variant === 'default'
      ? 'px-5 py-3 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-colors'
      : 'px-5 py-3 rounded-2xl bg-white border border-primary/20 text-primary hover:bg-primary/5 transition-colors';

  return (
    <a
      href={telLink}
      className={`${baseClasses} ${className}`}
      aria-label={t('hero.call')}
    >
      {t('hero.call')}
    </a>
  );
}

