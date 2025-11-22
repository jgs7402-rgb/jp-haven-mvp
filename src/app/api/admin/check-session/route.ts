import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET handler - Check if user session is valid
 */
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = verifySessionFromRequest(request);
    
    return NextResponse.json({
      authenticated: isAuthenticated,
    });
  } catch (error) {
    console.error('[CHECK SESSION] Error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

