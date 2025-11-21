import AdminNav from '@/components/admin/AdminNav';
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Vercel 서버리스 환경에서 동적 렌더링 강제
// cookies() 사용으로 인해 정적 렌더링 불가능
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const dynamicParams = true;

export default async function ProcessAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 세션 검증 (cookies 사용)
  let isAuthenticated = false;
  try {
    isAuthenticated = await verifySession();
  } catch (error) {
    console.error('[PROCESS LAYOUT] Session verification error:', error);
    // 에러 발생 시 로그인 페이지로 리다이렉트
    redirect('/admin/login');
  }

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}


