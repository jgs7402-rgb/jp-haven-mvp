'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // 입력값 검증
    if (!username.trim() || !password.trim()) {
      const errorMessage = '아이디와 비밀번호를 모두 입력해주세요.';
      alert(errorMessage);
      setError(errorMessage);
      return;
    }

    setIsLoading(true);

    try {
      console.log('[LOGIN] 로그인 시도 시작:', { username, hasPassword: !!password });
      
      let response;
      try {
        response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
          credentials: 'include',
        });
        console.log('[LOGIN] 응답 수신:', { 
          status: response.status, 
          statusText: response.statusText,
          ok: response.ok 
        });
      } catch (fetchError) {
        console.error('[LOGIN] Fetch 오류:', fetchError);
        setIsLoading(false);
        const errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
        alert(errorMessage);
        setError(errorMessage);
        return;
      }

      let data;
      try {
        const text = await response.text();
        console.log('[LOGIN] 응답 텍스트:', text);
        if (!text) {
          throw new Error('응답이 비어있습니다.');
        }
        data = JSON.parse(text);
        console.log('[LOGIN] 파싱된 데이터:', data);
      } catch (jsonError) {
        console.error('[LOGIN] JSON 파싱 오류:', jsonError);
        setIsLoading(false);
        const errorMessage = '서버 응답을 처리할 수 없습니다.';
        alert(errorMessage);
        setError(errorMessage);
        return;
      }

      // 응답 상태 확인
      if (!response.ok) {
        const errorMessage = data?.error || `로그인에 실패했습니다. (상태 코드: ${response.status})`;
        console.error('[LOGIN] 로그인 실패:', errorMessage);
        setIsLoading(false);
        alert(errorMessage);
        setError(errorMessage);
        return;
      }

      // 로그인 성공 확인
      if (data && data.success === true) {
        console.log('[LOGIN] ✅ 로그인 성공! 대시보드로 이동합니다.');
        setIsLoading(false);
        // 즉시 리다이렉트 - window.location 사용
        window.location.href = '/admin/dashboard';
        return;
      } else {
        // 성공 응답이지만 success가 false인 경우
        const errorMessage = data?.error || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';
        console.error('[LOGIN] ❌ 로그인 실패 - data:', data);
        setIsLoading(false);
        alert(errorMessage);
        setError(errorMessage);
        return;
      }
    } catch (err) {
      console.error('[LOGIN] 예상치 못한 오류:', err);
      setIsLoading(false);
      const errorMessage = err instanceof Error 
        ? `로그인 중 오류가 발생했습니다: ${err.message}` 
        : '로그인 중 알 수 없는 오류가 발생했습니다.';
      alert(errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 로고/타이틀 영역 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            관리자 로그인
          </h1>
          <p className="text-gray-600 text-sm">
            JP Haven 관리자 페이지에 접속하세요
          </p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                아이디
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="아이디를 입력하세요"
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                />
              </div>
            </div>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  로그인 중...
                </span>
              ) : (
                '로그인'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
