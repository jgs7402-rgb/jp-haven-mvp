import AdminNav from '@/components/admin/AdminNav';

// Vercel 서버리스 환경에서 동적 렌더링 강제
// admin 섹션은 모두 세션 기반이므로 동적 렌더링 필요
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const dynamicParams = true;

export default function RegionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </>
  );
}

