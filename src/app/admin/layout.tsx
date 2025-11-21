import AdminNav from '@/components/admin/AdminNav';
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAuthenticated = false;

  try {
    // 여기서 쿠키/세션 검사
    isAuthenticated = await verifySession();
  } catch (error) {
    console.error('[ADMIN LAYOUT] Session verification error:', error);
  }

  if (!isAuthenticated) {
    // 로그인 안했으면 로그인 페이지로 보내기
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
