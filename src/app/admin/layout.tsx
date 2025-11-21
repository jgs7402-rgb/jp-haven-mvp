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
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

