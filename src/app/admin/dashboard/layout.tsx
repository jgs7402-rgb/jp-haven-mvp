import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('[DASHBOARD] 레이아웃 렌더링 시작');
  
  const isAuthenticated = await verifySession();
  console.log('[DASHBOARD] 인증 상태:', isAuthenticated);

  if (!isAuthenticated) {
    console.log('[DASHBOARD] 인증 실패, 로그인 페이지로 리다이렉트');
    redirect('/admin/login');
  }

  console.log('[DASHBOARD] 인증 성공, 대시보드 표시');
  return (
    <>
      <AdminNav />
      <main className="p-6">{children}</main>
    </>
  );
}

