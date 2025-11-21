'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LocaleNotFound() {
  const t = useTranslations();
  
  return (
    <div className="min-h-screen bg-background text-primary flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">
          {t('detail.notFound') || '페이지를 찾을 수 없습니다'}
        </h2>
        <p className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          홈으로 가기
        </Link>
      </div>
    </div>
  );
}

