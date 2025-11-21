'use client';

import { useEffect, useState, FormEvent } from 'react';

type Locale = 'ko' | 'vi';

export default function ProcessAdminPage() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [steps, setSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSteps = async (targetLocale: Locale) => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/process?locale=${targetLocale}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to load process steps');
      }
      const data = await res.json();
      setSteps(data.steps || []);
    } catch (err) {
      console.error('[PROCESS] Admin fetch error:', err);
      setError('장례 절차 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSteps(locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/process', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ locale, steps }),
      });

      if (!res.ok) {
        throw new Error('Failed to save process steps');
      }

      setMessage('장례 절차 정보가 저장되었습니다.');
    } catch (err) {
      console.error('[PROCESS] Admin save error:', err);
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStep = (index: number, value: string) => {
    const next = [...steps];
    next[index] = value;
    setSteps(next);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    const next = steps.filter((_, i) => i !== index);
    setSteps(next);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">장례 절차 관리</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              관리할 언어
            </span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ko">한국어</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            불러오는 중...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-gray-500 mb-2">
              순서를 드래그하지는 못하지만, 위에서부터 1번, 2번 순서로 표시됩니다.
            </p>
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-2 bg-gray-50 rounded-xl p-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold mt-1">
                  {index + 1}
                </div>
                <textarea
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  placeholder="장례 절차 내용을 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="mt-1 text-xs text-red-600 hover:text-red-800"
                >
                  삭제
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addStep}
              className="mt-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
            >
              + 절차 추가
            </button>

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

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


