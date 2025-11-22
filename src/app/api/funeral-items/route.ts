import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FUNERAL_ITEMS_TABLE = 'funeral_items';

/**
 * GET handler - Public API for fetching funeral items
 * Returns locale-specific content (KR for Korean pages, VI for Vietnamese pages)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'ko';

    // Validate locale
    if (locale !== 'ko' && locale !== 'vi') {
      return NextResponse.json(
        { error: `Invalid locale. Must be "ko" or "vi"` },
        { status: 400 }
      );
    }

    console.log('[FUNERAL ITEMS] Public API GET request:', { locale });

    // Fetch all funeral items ordered by step_number
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

    // Transform data based on locale
    const items = (data || []).map((item) => {
      if (locale === 'ko') {
        // Korean page - return Korean content only
        return {
          id: item.id,
          title: item.title_ko,
          description: item.description_ko,
          images: item.images || [],
          step_number: item.step_number,
          created_at: item.created_at,
          updated_at: item.updated_at,
        };
      } else {
        // Vietnamese page - return Vietnamese content only (NO English)
        return {
          id: item.id,
          title: item.title_vi,
          description: item.description_vi,
          images: item.images || [],
          step_number: item.step_number,
          created_at: item.created_at,
          updated_at: item.updated_at,
        };
      }
    });

    console.log('[FUNERAL ITEMS] Public API GET success:', {
      locale,
      count: items.length,
    });

    return NextResponse.json({
      success: true,
      locale,
      items,
    });
  } catch (error) {
    console.error('[FUNERAL ITEMS] Public API GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

