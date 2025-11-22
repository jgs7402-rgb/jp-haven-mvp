import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { supabase, PROCESS_STEPS_TABLE } from '@/lib/supabase';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 관리자용 GET 핸들러
 * 특정 locale의 장례 절차 목록을 가져옵니다.
 */
export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    console.log('[PROCESS] Admin GET 요청:', { locale });

    // Supabase에서 해당 locale의 절차 목록 가져오기 (step_order 순서대로 정렬)
    const { data, error } = await supabase
      .from(PROCESS_STEPS_TABLE)
      .select('id, locale, step_order, text')
      .eq('locale', locale)
      .order('step_order', { ascending: true });

    if (error) {
      console.error('[PROCESS] Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch process steps', details: error.message },
        { status: 500 }
      );
    }

    // step_order 순서대로 정렬된 text 배열 생성
    const steps = (data || [])
      .sort((a: { step_order: number }, b: { step_order: number }) => a.step_order - b.step_order)
      .map((step: { text: string }) => step.text);

    console.log('[PROCESS] Admin GET 성공:', { locale, count: steps.length });
    return NextResponse.json({ steps });
  } catch (error) {
    console.error('[PROCESS] Admin GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * 관리자용 PUT 핸들러
 * 특정 locale의 장례 절차 목록을 저장합니다.
 * 한국어 저장 시 베트남어로도 자동 동기화합니다.
 */
export async function PUT(request: NextRequest) {
  console.log('[PROCESS] PUT 요청 수신');

  try {
    const isAuthenticated = verifySessionFromRequest(request);
    if (!isAuthenticated) {
      console.log('[PROCESS] 인증 실패');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[PROCESS] 인증 성공');

    // 요청 본문 파싱
    let body: { locale?: string; steps?: string[] };
    try {
      body = await request.json();
      console.log('[PROCESS] 파싱된 데이터:', {
        locale: body.locale,
        stepsCount: body.steps?.length || 0,
        hasSteps: !!body.steps,
      });
    } catch (parseError) {
      const parseErrorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      console.error('[PROCESS] JSON 파싱 오류:', parseErrorMessage);
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          details: parseErrorMessage,
        },
        { status: 400 }
      );
    }

    if (!body) {
      console.error('[PROCESS] body가 null 또는 undefined');
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    const { locale, steps } = body;

    // 입력 검증
    if (!locale || (locale !== 'ko' && locale !== 'vi')) {
      console.error('[PROCESS] 잘못된 locale:', locale);
      return NextResponse.json(
        { error: `Invalid locale. Must be "ko" or "vi", but got: ${locale}` },
        { status: 400 }
      );
    }

    if (!steps || !Array.isArray(steps)) {
      console.error('[PROCESS] steps가 배열이 아님:', typeof steps, steps);
      return NextResponse.json(
        { error: `Steps must be an array, but got: ${typeof steps}` },
        { status: 400 }
      );
    }

    console.log('[PROCESS] 입력 검증 통과');

    // 빈 문자열 제거 및 trim
    const trimmedSteps = steps
      .map((s) => (typeof s === 'string' ? s.trim() : String(s || '').trim()))
      .filter((s) => s.length > 0);

    console.log('[PROCESS] 정리된 steps:', {
      originalCount: steps.length,
      trimmedCount: trimmedSteps.length,
    });

    if (trimmedSteps.length === 0) {
      console.error('[PROCESS] 모든 steps가 비어있음');
      return NextResponse.json(
        { error: 'At least one non-empty step is required' },
        { status: 400 }
      );
    }

    // Supabase에 저장할 데이터 형식으로 변환
    const processSteps = trimmedSteps.map((text, index) => ({
      locale,
      step_order: index + 1, // 1부터 시작하는 순서
      text,
    }));

    // 트랜잭션: 기존 데이터 삭제 후 새 데이터 삽입
    console.log('[PROCESS] Supabase 저장 시작:', { locale, count: processSteps.length });

    // 1. 기존 데이터 삭제
    const { error: deleteError } = await supabase
      .from(PROCESS_STEPS_TABLE)
      .delete()
      .eq('locale', locale);

    if (deleteError) {
      console.error('[PROCESS] 기존 데이터 삭제 실패:', deleteError);
      return NextResponse.json(
        {
          error: 'Failed to delete existing process steps',
          details: deleteError.message,
        },
        { status: 500 }
      );
    }

    // 2. 새 데이터 삽입
    const { data: insertData, error: insertError } = await supabase
      .from(PROCESS_STEPS_TABLE)
      .insert(processSteps)
      .select();

    if (insertError) {
      console.error('[PROCESS] 새 데이터 삽입 실패:', insertError);
      return NextResponse.json(
        {
          error: 'Failed to insert process steps',
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    console.log('[PROCESS] 저장 성공:', { locale, count: insertData?.length || 0 });

    // 한국어 저장 시 베트남어로 동기화 (번역 없이 같은 steps 복사)
    let syncSuccess = false;
    let syncError: string | null = null;

    if (locale === 'ko') {
      const targetLocale = 'vi';
      console.log('[PROCESS] 한국어 저장 감지, 베트남어 동기화 시작:', {
        original: locale,
        target: targetLocale,
        stepsCount: trimmedSteps.length,
      });

      try {
        // 베트남어 절차 데이터 생성 (같은 text 사용)
        const vietnameseSteps = trimmedSteps.map((text, index) => ({
          locale: targetLocale,
          step_order: index + 1,
          text, // 번역 없이 같은 텍스트
        }));

        // 1. 베트남어 기존 데이터 삭제
        const { error: viDeleteError } = await supabase
          .from(PROCESS_STEPS_TABLE)
          .delete()
          .eq('locale', targetLocale);

        if (viDeleteError) {
          throw new Error(`베트남어 기존 데이터 삭제 실패: ${viDeleteError.message}`);
        }

        // 2. 베트남어 새 데이터 삽입
        const { error: viInsertError } = await supabase
          .from(PROCESS_STEPS_TABLE)
          .insert(vietnameseSteps)
          .select();

        if (viInsertError) {
          throw new Error(`베트남어 새 데이터 삽입 실패: ${viInsertError.message}`);
        }

        syncSuccess = true;
        console.log('[PROCESS] 베트남어 동기화 완료:', {
          original: locale,
          synced: targetLocale,
          count: vietnameseSteps.length,
        });
      } catch (syncErr) {
        syncError = syncErr instanceof Error ? syncErr.message : String(syncErr);
        const syncErrStack = syncErr instanceof Error ? syncErr.stack : undefined;
        console.error('[PROCESS] 베트남어 동기화 오류 (한국어 저장은 성공):', {
          message: syncError,
          stack: syncErrStack,
        });
        // 동기화 실패해도 원본 저장은 성공했으므로 계속 진행
      }
    } else {
      // 베트남어로 저장한 경우에는 동기화하지 않음
      console.log('[PROCESS] 베트남어 저장 감지, 한국어 동기화 생략 (단방향: ko → vi만 동기화)');
    }

    // 성공 응답
    let finalMessage: string;
    if (syncSuccess && locale === 'ko') {
      finalMessage = `한국어 장례 절차가 저장되었고, 베트남어 버전으로도 자동 동기화되었습니다. 상용 페이지에 즉시 반영됩니다.`;
    } else if (locale === 'ko' && !syncSuccess && syncError) {
      finalMessage = `한국어 장례 절차가 저장되었습니다. 베트남어 동기화는 실패했습니다. (${syncError})`;
    } else {
      finalMessage = `${locale === 'ko' ? '한국어' : '베트남어'} 장례 절차가 저장되었고, 상용 페이지에 즉시 반영됩니다.`;
    }

    return NextResponse.json({
      success: true,
      message: finalMessage,
      syncSuccess: syncSuccess && locale === 'ko',
      locale,
      stepsCount: trimmedSteps.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[PROCESS] Admin update error:', { message: errorMessage, stack: errorStack });

    return NextResponse.json(
      {
        error: 'Failed to update process steps',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
