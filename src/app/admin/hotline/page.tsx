'use client';

import { useEffect, useState, FormEvent } from 'react';

type HotlineData = {
  phone: string;
  hoursKo: string;
  hoursVi: string;
};

export default function HotlineAdminPage() {
  const [data, setData] = useState<HotlineData>({
    phone: '+82-00-0000-0000',
    hoursKo: '상담시간 08:00–21:00',
    hoursVi: 'Giờ tư vấn 08:00–21:00',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotline = async () => {
      try {
        const res = await fetch('/api/admin/hotline', {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('Failed to load hotline data');
        }
        const json = await res.json();
        setData({
          phone: json.phone || '+82-00-0000-0000',
          hoursKo: json.hoursKo || '상담시간 08:00–21:00',
          hoursVi: json.hoursVi || 'Giờ tư vấn 08:00–21:00',
        });
      } catch (err) {
        console.error('[HOTLINE] Admin fetch error:', err);
        setError('핫라인 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotline();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/hotline', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to save hotline data');
      }

      setMessage('핫라인 정보가 저장되었습니다.');
    } catch (err) {
      console.error('[HOTLINE] Admin save error:', err);
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
          <p className="text-center text-gray-600">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900">
            핫라인 정보 관리
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전화번호
            </label>
            <input
              type="text"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="+82-00-0000-0000"
            />
            <p className="mt-1 text-xs text-gray-400">
              예: +82-10-1234-5678 또는 02-123-4567
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상담시간 (한국어)
            </label>
            <input
              type="text"
              value={data.hoursKo}
              onChange={(e) => setData({ ...data, hoursKo: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="상담시간 08:00–21:00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상담시간 (베트남어)
            </label>
            <input
              type="text"
              value={data.hoursVi}
              onChange={(e) => setData({ ...data, hoursVi: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Giờ tư vấn 08:00–21:00"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 rounded-xl bg-green-50 text-green-700 text-sm">
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 pb-4">
            <button
              type="button"
              onClick={() => {
                // 단순히 페이지를 벗어나도록
                window.history.back();
              }}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              닫기
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


