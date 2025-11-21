import AdminNav from '@/components/admin/AdminNav';
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ContactsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifySession();

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


