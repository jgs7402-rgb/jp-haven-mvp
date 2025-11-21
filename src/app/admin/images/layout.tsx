import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function ImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifySession();

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


