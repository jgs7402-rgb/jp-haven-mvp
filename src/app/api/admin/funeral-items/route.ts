import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FUNERAL_ITEMS_TABLE = 'funeral_items';

/**
 * GET handler - Fetch all funeral items for admin
 */
export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from(FUNERAL_ITEMS_TABLE)
      .select('*')
      .order('step_number', { ascending: true });

    if (error) {
      console.error('[FUNERAL ITEMS] Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch funeral items', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('[FUNERAL ITEMS] GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
