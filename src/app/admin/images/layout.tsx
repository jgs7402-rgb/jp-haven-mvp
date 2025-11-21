import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

// Vercel 서버리스 환경에서 동적 렌더링 강제
// cookies() 사용으로 인해 정적 렌더링 불가능
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const dynamicParams = true;

export default async function ImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAuthenticated = false;
  try {
    isAuthenticated = await verifySession();
  } catch (error) {
    console.error('[IMAGES] Session verification error:', error);
    redirect('/admin/login');
  }

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  return (
    <>
      <AdminNav />
      <main className="p-6">{children}</main>
    </>
  );
}


