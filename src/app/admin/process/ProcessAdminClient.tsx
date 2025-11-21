// ⚠ 여기에는 'use client' 쓰지 않는다 (서버 컴포넌트)

import AdminNav from '@/components/admin/AdminNav';
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProcessAdminClient from './ProcessAdminClient';

// 이 페이지는 항상 서버에서 동적으로 렌더링해라
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ProcessAdminPage() {
  let isAuthenticated = false;

  try {
    // 여기서 쿠키/세션 검사
    isAuthenticated = await verifySession();
  } catch (error) {
    console.error('[PROCESS PAGE] Session verification error:', error);
  }

  if (!isAuthenticated) {
    // 로그인 안 했으면 로그인 페이지로 보내기
    redirect('/admin/login');
  }

  // 로그인 OK인 경우에만 화면 보여주기
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <ProcessAdminClient />
      </main>
    </div>
  );
}
