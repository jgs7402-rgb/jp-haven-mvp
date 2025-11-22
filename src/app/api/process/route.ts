import { NextRequest, NextResponse } from 'next/server';
import { supabase, PROCESS_STEPS_TABLE } from '@/lib/supabase';

// Vercel 서버리스 환경에서 동적 렌더링 강제
// 항상 최신 데이터를 가져오도록 캐시 없이 처리
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 공개 API GET 핸들러
 * 특정 locale의 장례 절차 목록을 가져옵니다.
 * 인증 없이 접근 가능합니다.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'ko';

  // locale 검증
  if (locale !== 'ko' && locale !== 'vi') {
    return NextResponse.json(
      { error: `Invalid locale. Must be "ko" or "vi"` },
      { status: 400 }
    );
  }

  try {
    console.log('[PROCESS] Public API GET 요청:', { locale });

    // Supabase에서 해당 locale의 절차 목록 가져오기 (step_order 순서대로 정렬)
    const { data, error } = await supabase
      .from(PROCESS_STEPS_TABLE)
      .select('id, locale, step_order, text')
      .eq('locale', locale)
      .order('step_order', { ascending: true });

    if (error) {
      console.error('[PROCESS] Supabase query error:', error);
      // 에러 발생 시 빈 배열 반환 (상용 페이지가 깨지지 않도록)
      return NextResponse.json({ steps: [] }, { status: 200 });
    }

    // step_order 순서대로 정렬된 text 배열 생성
    const steps = (data || [])
      .sort((a, b) => a.step_order - b.step_order)
      .map((step) => step.text);

    console.log('[PROCESS] Public API GET 성공:', { locale, count: steps.length });
    return NextResponse.json({ steps: Array.isArray(steps) ? steps : [] });
  } catch (error) {
    console.error('[PROCESS] Public API GET error:', error);
    // 에러 발생 시 빈 배열 반환 (상용 페이지가 깨지지 않도록)
    return NextResponse.json({ steps: [] }, { status: 200 });
  }
}
