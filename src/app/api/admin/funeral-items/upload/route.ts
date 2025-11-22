import { NextResponse } from 'next/server';

// This route is temporarily disabled to avoid Supabase env errors during build.
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
