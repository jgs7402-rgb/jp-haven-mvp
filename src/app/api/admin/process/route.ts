import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { safeWriteFile, getDataFilePath, isVercelEnvironment } from '@/lib/vercel-file-utils';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'ko';

  try {
    const filePath = join(process.cwd(), 'data', `process.${locale}.json`);
    const data = await readFile(filePath, 'utf-8');
    const steps = JSON.parse(data);
    return NextResponse.json({ steps });
  } catch (error) {
    console.error('[PROCESS] Admin read error:', error);
    return NextResponse.json({ steps: [] }, { status: 200 });
  }
}

// 번역 API를 사용하여 텍스트 번역
async function translateText(text: string, source: string = 'ko', target: string = 'vi'): Promise<string> {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return text;
  }
  
  // 기본 번역 맵 (우선 사용)
  const translationMap: Record<string, string> = {
    '문의 접수': 'Tiếp nhận yêu cầu',
    '상담 및 예산 가이드': 'Tư vấn & ngân sách',
    '장지 후보 제안/예약': 'Đề xuất/đặt chỗ nơi an táng',
    '의전/운구/화장 연계': 'Phối hợp nghi lễ/di quan/hỏa táng',
    '봉안/안치 진행': 'An vị/đặt tro cốt',
    '사후 안내 및 관리': 'Hướng dẫn & chăm sóc hậu sự',
    // 베트남어 -> 한국어
    'Tiếp nhận yêu cầu': '문의 접수',
    'Tư vấn & ngân sách': '상담 및 예산 가이드',
    'Đề xuất/đặt chỗ nơi an táng': '장지 후보 제안/예약',
    'Phối hợp nghi lễ/di quan/hỏa táng': '의전/운구/화장 연계',
    'An vị/đặt tro cốt': '봉안/안치 진행',
    'Hướng dẫn & chăm sóc hậu sự': '사후 안내 및 관리',
  };
  
  // 번역 맵에서 먼저 확인
  if (translationMap[text]) {
    return translationMap[text];
  }
  
  // Google Translate API 사용 (환경 변수 설정 시) - 선택적
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  
  if (apiKey) {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: source,
          target: target,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data?.translations?.[0]?.translatedText) {
          return data.data.translations[0].translatedText;
        }
      }
    } catch (error) {
      // API 실패는 무시하고 기본 번역 맵 사용
      console.warn('[PROCESS] Google Translate API error (ignored):', error instanceof Error ? error.message : String(error));
    }
  }
  
  // 모든 번역 시도 실패 시 원본 텍스트 반환
  return text;
}

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
        stepsType: typeof body.steps
      });
    } catch (parseError) {
      const parseErrorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      console.error('[PROCESS] JSON 파싱 오류:', parseErrorMessage);
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body', 
          details: parseErrorMessage 
        },
        { status: 400 }
      );
    }
    
    if (!body) {
      console.error('[PROCESS] body가 null 또는 undefined');
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
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

    const trimmedSteps = steps
      .map((s) => (typeof s === 'string' ? s.trim() : String(s || '').trim()))
      .filter((s) => s.length > 0);

    console.log('[PROCESS] 정리된 steps:', { 
      originalCount: steps.length, 
      trimmedCount: trimmedSteps.length 
    });

    if (trimmedSteps.length === 0) {
      console.error('[PROCESS] 모든 steps가 비어있음');
      return NextResponse.json(
        { error: 'At least one non-empty step is required' },
        { status: 400 }
      );
    }

    // Vercel 환경 확인
    const isVercel = isVercelEnvironment();
    console.log('[PROCESS] 환경 정보:', { isVercel });
    
    // 현재 언어로 저장
    const filePath = getDataFilePath(`process.${locale}.json`);
    const jsonContent = JSON.stringify(trimmedSteps, null, 2);
    
    console.log('[PROCESS] 저장할 파일 경로:', filePath);
    console.log('[PROCESS] 저장할 JSON 내용 길이:', jsonContent.length);
    
    // 안전하게 파일 쓰기 (Vercel 환경 대응)
    const writeResult = await safeWriteFile(filePath, jsonContent);
    
    if (!writeResult.success && !isVercel) {
      // 로컬 환경에서만 파일 쓰기 실패 시 에러 반환
      return NextResponse.json(
        { 
          error: 'Failed to save process steps',
          details: writeResult.error,
          filePath
        },
        { status: 500 }
      );
    }
    
    const fileWriteSuccess = writeResult.success;
    if (fileWriteSuccess) {
      console.log('[PROCESS] File saved successfully:', { locale, count: trimmedSteps.length, filePath });
    } else {
      console.warn('[PROCESS] File write failed (but continuing):', writeResult.error);
    }

    // 다른 언어로 자동 번역하여 동기화 (비동기로 처리, 실패해도 원본 저장은 성공)
    const targetLocale = locale === 'ko' ? 'vi' : 'ko';
    let syncSuccess = false;
    let syncError: string | null = null;
    
    console.log('[PROCESS] 동기화 시작:', { original: locale, target: targetLocale });
    
    try {
      // 각 단계를 번역
      const translatedSteps: string[] = [];
      for (let i = 0; i < trimmedSteps.length; i++) {
        const step = trimmedSteps[i];
        try {
          console.log(`[PROCESS] 번역 중 (${i + 1}/${trimmedSteps.length}):`, step.substring(0, 50));
          const translated = await translateText(step, locale, targetLocale);
          translatedSteps.push(translated);
          console.log(`[PROCESS] 번역 완료:`, translated.substring(0, 50));
        } catch (stepError) {
          const stepErrorMessage = stepError instanceof Error ? stepError.message : String(stepError);
          console.warn(`[PROCESS] 단계 ${i + 1} 번역 실패, 원본 사용:`, stepErrorMessage);
          // 개별 단계 번역 실패 시 원본 텍스트 사용
          translatedSteps.push(step);
        }
      }

      console.log('[PROCESS] 번역 완료, 파일 저장 시작:', { count: translatedSteps.length });

      // 번역된 내용을 다른 언어 파일에 저장
      const targetFilePath = getDataFilePath(`process.${targetLocale}.json`);
      const targetJsonContent = JSON.stringify(translatedSteps, null, 2);
      
      console.log('[PROCESS] 동기화 파일 경로:', targetFilePath);
      
      // 안전하게 파일 쓰기 (Vercel 환경 대응)
      const syncWriteResult = await safeWriteFile(targetFilePath, targetJsonContent);
      
      if (syncWriteResult.success) {
        syncSuccess = true;
        console.log('[PROCESS] Sync completed successfully:', { 
          original: locale, 
          synced: targetLocale, 
          count: translatedSteps.length,
          filePath: targetFilePath
        });
      } else {
        const writeErrorMessage = syncWriteResult.error || 'Unknown error';
        console.error('[PROCESS] 동기화 파일 쓰기 실패:', { 
          message: writeErrorMessage,
          filePath: targetFilePath,
          isVercel
        });
        
        // Vercel 환경에서는 파일 쓰기 실패를 에러로 기록하지 않음
        if (!isVercel) {
          syncError = writeErrorMessage;
        } else {
          console.warn('[PROCESS] Vercel 환경에서 동기화 파일 쓰기 실패 (예상된 동작일 수 있음)');
        }
      }
    } catch (syncErr) {
      syncError = syncErr instanceof Error ? syncErr.message : String(syncErr);
      const syncErrStack = syncErr instanceof Error ? syncErr.stack : undefined;
      console.error('[PROCESS] Sync error (original save succeeded):', { 
        message: syncError,
        stack: syncErrStack
      });
      // 동기화 실패해도 원본 저장은 성공했으므로 계속 진행
    }

    // 성공 응답
    // Vercel 환경에서는 파일 쓰기가 실패할 수 있지만, 데이터 처리는 성공한 것으로 간주
    // 실제로는 Git에 커밋된 파일만 읽을 수 있으므로, Vercel 환경에서는 파일 수정이 불가능합니다.
    
    let finalMessage: string;
    if (isVercel && !fileWriteSuccess) {
      // Vercel 환경에서 파일 쓰기 실패
      finalMessage = `${locale === 'ko' ? '한국어' : '베트남어'} 장례 절차가 처리되었습니다. (주의: Vercel 환경 제한으로 인해 파일 저장이 되지 않을 수 있습니다. 로컬에서 Git에 커밋하거나 외부 스토리지를 사용하세요.)`;
    } else if (fileWriteSuccess && syncSuccess) {
      // 파일 쓰기와 동기화 모두 성공
      finalMessage = `${locale === 'ko' ? '한국어' : '베트남어'} 장례 절차가 저장되었고, ${targetLocale === 'ko' ? '한국어' : '베트남어'} 버전으로도 자동 동기화되었습니다.`;
    } else if (fileWriteSuccess) {
      // 파일 쓰기는 성공, 동기화는 실패
      finalMessage = `${locale === 'ko' ? '한국어' : '베트남어'} 장례 절차가 저장되었습니다.${syncError ? ` (동기화 실패: ${syncError})` : ''}`;
    } else {
      // 파일 쓰기 실패 (로컬 환경이지만 실패한 경우)
      finalMessage = `${locale === 'ko' ? '한국어' : '베트남어'} 장례 절차가 처리되었습니다. (파일 저장 실패: ${fileWriteError})`;
    }
    
    return NextResponse.json({ 
      success: true,
      message: finalMessage,
      syncSuccess: syncSuccess && fileWriteSuccess,
      fileWriteSuccess,
      isVercel,
      warning: isVercel && !fileWriteSuccess 
        ? 'Vercel 환경에서는 파일 시스템이 읽기 전용입니다. 데이터를 영구 저장하려면 Git에 커밋하거나 외부 스토리지를 사용하세요.'
        : undefined
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[PROCESS] Admin update error:', { message: errorMessage, stack: errorStack });
    
    return NextResponse.json(
      { 
        error: 'Failed to update process steps',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
