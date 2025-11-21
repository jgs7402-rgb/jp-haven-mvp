import AdminNav from '@/components/admin/AdminNav';
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Vercel 서버리스 환경에서 동적 렌더링 강제
// admin 섹션은 모두 세션 기반이므로 동적 렌더링 필요
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const dynamicParams = true;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 세션 검증 (cookies 사용)
  let isAuthenticated = false;

  try {
    isAuthenticated = await verifySession();
  } catch (error) {
    console.error('[ADMIN LAYOUT] Session verification error:', error);
    redirect('/admin/login');
  }

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  // 로그인 OK면 admin 전체 공통 레이아웃 렌더
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
