'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Locale error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-red-600">500</h1>
        <h2 className="text-2xl font-semibold mb-4">서버 오류가 발생했습니다</h2>
        <p className="text-gray-600 mb-8">
          죄송합니다. 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/ko"
            className="px-6 py-3 bg-white border border-primary/20 text-primary rounded-xl hover:bg-primary/5 transition-colors"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  );
}

