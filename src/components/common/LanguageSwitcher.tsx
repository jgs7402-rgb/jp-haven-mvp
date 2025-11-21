'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(pathname, { locale: e.target.value });
  };

  return (
    <select
      aria-label="language"
      value={locale}
      onChange={handleChange}
      className="px-2 py-2 rounded-xl border border-primary/20 bg-white text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <option value="ko">한국어</option>
      <option value="vi">Tiếng Việt</option>
    </select>
  );
}

