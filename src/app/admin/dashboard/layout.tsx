import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

// Vercel 서버리스 환경에서 동적 렌더링 강제
// cookies() 사용으로 인해 정적 렌더링 불가능
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const dynamicParams = true;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAuthenticated = false;
  try {
    isAuthenticated = await verifySession();
  } catch (error) {
    console.error('[DASHBOARD] Session verification error:', error);
    redirect('/admin/login');
  }

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  console.log('[DASHBOARD] 인증 성공, 대시보드 표시');
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}

