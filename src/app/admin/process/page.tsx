'use client';

// 참고: 클라이언트 컴포넌트에서는 export const dynamic이 작동하지 않습니다.
// 동적 렌더링은 상위 레이아웃(src/app/admin/process/layout.tsx)의 dynamic 설정에 의해 처리됩니다.

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
      console.log('[PROCESS] 저장 요청 시작:', { locale, stepsCount: steps.length });
      
      const res = await fetch('/api/admin/process', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ locale, steps }),
      });

      console.log('[PROCESS] 응답 상태:', res.status, res.statusText);

      // 응답 본문 읽기 (성공/실패 모두)
      let data;
      try {
        const text = await res.text();
        console.log('[PROCESS] 응답 본문:', text);
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('[PROCESS] JSON 파싱 오류:', parseError);
        throw new Error('서버 응답을 처리할 수 없습니다.');
      }

      if (!res.ok) {
        // 에러 응답 처리
        const errorMessage = data.error || data.details || `저장 실패 (상태 코드: ${res.status})`;
        console.error('[PROCESS] 저장 실패:', errorMessage);
        setError(errorMessage);
        return;
      }

      // 성공 응답 처리
      console.log('[PROCESS] 저장 성공:', data);
      
      // 경고 메시지 확인
      if (data.warning) {
        console.warn('[PROCESS] 경고:', data.warning);
        setMessage(`${data.message || '장례 절차 정보가 처리되었습니다.'} (주의: ${data.warning})`);
      } else {
        // 서버에서 받은 메시지 사용 (동기화 정보 포함)
        const successMessage = data.message || 
          (data.fileWriteSuccess 
            ? '장례 절차 정보가 저장되었고, 상용 페이지에 즉시 반영됩니다.' 
            : '장례 절차 정보가 저장되었습니다.');
        setMessage(successMessage);
      }
      
      // 저장 성공 후 현재 언어 버전 다시 로드
      await loadSteps(locale);
      
      // 한국어 저장 시 베트남어 동기화가 성공했으면 베트남어 버전도 다시 로드
      if (data.syncSuccess && locale === 'ko') {
        setTimeout(async () => {
          await loadSteps('vi');
        }, 500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      console.error('[PROCESS] Admin save error:', err);
      setError(`저장 중 오류가 발생했습니다: ${errorMessage}`);
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


