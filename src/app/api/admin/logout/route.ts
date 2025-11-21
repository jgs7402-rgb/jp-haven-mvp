import { NextResponse } from 'next/server';
import { deleteSessionInResponse } from '@/lib/auth';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ success: true });
  return deleteSessionInResponse(response);
}

