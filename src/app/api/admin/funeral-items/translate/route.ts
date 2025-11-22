import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { translateKRtoVI } from '@/lib/translate';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST handler - Translate Korean to Vietnamese
 */
export async function POST(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title_ko, description_ko } = body;

    if (!title_ko || !description_ko) {
      return NextResponse.json(
        { error: 'Korean title and description are required' },
        { status: 400 }
      );
    }

    console.log('[FUNERAL ITEMS TRANSLATE] Translating...');

    // Translate both in parallel
    const [title_vi, description_vi] = await Promise.all([
      translateKRtoVI(title_ko),
      translateKRtoVI(description_ko),
    ]);

    console.log('[FUNERAL ITEMS TRANSLATE] Translation completed');

    return NextResponse.json({
      success: true,
      title_vi,
      description_vi,
    });
  } catch (error) {
    console.error('[FUNERAL ITEMS TRANSLATE] Translation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to translate',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

