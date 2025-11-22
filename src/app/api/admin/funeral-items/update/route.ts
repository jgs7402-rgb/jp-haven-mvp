// app/api/admin/funeral-items/upload/route.ts
import { NextResponse } from 'next/server';

// 이 라우트는 지금은 Supabase 없이 빌드만 통과시키기 위한 임시 버전입니다.
export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: 'Funeral items upload API is temporarily disabled on this environment.',
    },
    { status: 503 },
  );
}
