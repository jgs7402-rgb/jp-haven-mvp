import AdminNav from '@/components/admin/AdminNav';
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const dynamicParams = true;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 현재 경로 확인 (middleware에서 설정한 헤더 사용)
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  
  // 로그인 페이지인지 확인
  const isLoginPage = pathname === '/admin/login';
  
  console.log('[ADMIN LAYOUT] Current pathname:', pathname, 'isLoginPage:', isLoginPage);

  // 로그인 페이지는 세션 검증 건너뛰고 바로 렌더링
  if (isLoginPage) {
    console.log('[ADMIN LAYOUT] Login page detected, skipping session check');
    return <>{children}</>;
  }

  // 로그인 페이지가 아니면 세션 검증 수행
  let isAuthenticated = false;

  try {
    isAuthenticated = await verifySession();
    console.log('[ADMIN LAYOUT] Session verification result:', isAuthenticated);
  } catch (error) {
    console.error('[ADMIN LAYOUT] Session verification error:', error);
    redirect('/admin/login');
  }

  if (!isAuthenticated) {
    console.log('[ADMIN LAYOUT] Not authenticated, redirecting to login');
    redirect('/admin/login');
  }

  // 로그인 OK면 admin 전체 공통 레이아웃 렌더
  console.log('[ADMIN LAYOUT] Authenticated, rendering admin layout');
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
