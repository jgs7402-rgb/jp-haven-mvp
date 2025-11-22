import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FUNERAL_PROCESS_STEPS_TABLE = 'funeral_process_steps';

/**
 * GET handler - Public API for fetching funeral process steps
 * Returns locale-specific content (KR for Korean pages, VI for Vietnamese pages)
 * Vietnamese pages must NEVER contain English
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

    console.log('[PROCESS] Public API GET request:', { locale });

    // Fetch all funeral steps for the locale, ordered by step_order
    const { data, error } = await supabase
      .from(FUNERAL_PROCESS_STEPS_TABLE)
      .select('*')
      .eq('locale', locale)
      .order('step_order', { ascending: true });

    if (error) {
      console.error('[PROCESS] Supabase query error:', error);
      // Return empty array instead of error to prevent page crash
      return NextResponse.json({
        success: true,
        locale,
        steps: [],
      });
    }

    // Transform data to include title, description, images
    const steps = (data || []).map((item: any) => ({
      id: item.id,
      step_order: item.step_order,
      title: item.title,
      description: item.description,
      images: item.images || [],
    }));

    console.log('[PROCESS] Public API GET success:', {
      locale,
      count: steps.length,
    });

    return NextResponse.json({
      success: true,
      locale,
      steps,
    });
  } catch (error) {
    console.error('[PROCESS] Public API GET error:', error);
    // Return empty array instead of error to prevent page crash
    return NextResponse.json({
      success: true,
      locale: searchParams.get('locale') || 'ko',
      steps: [],
    });
  }
}
