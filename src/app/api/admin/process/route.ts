import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { translateKRtoVI } from '@/lib/translate';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FUNERAL_PROCESS_STEPS_TABLE = 'funeral_process_steps';

export interface ProcessStep {
  id?: string;
  locale: 'ko' | 'vi';
  step_order: number;
  title: string;
  description: string;
  images: string[];
}

/**
 * GET handler - Fetch funeral steps by locale for admin
 */
export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'ko';

  try {
    // Validate locale
    if (locale !== 'ko' && locale !== 'vi') {
      return NextResponse.json(
        {
          error:
            locale === 'ko'
              ? '잘못된 언어 코드입니다. "ko" 또는 "vi"만 사용 가능합니다.'
              : 'Mã ngôn ngữ không hợp lệ. Chỉ có thể sử dụng "ko" hoặc "vi".',
        },
        { status: 400 }
      );
    }

    console.log('[PROCESS] Admin GET request:', { locale });

    // Fetch all funeral steps for the locale, ordered by step_order
    const { data, error } = await supabase
      .from(FUNERAL_PROCESS_STEPS_TABLE)
      .select('*')
      .eq('locale', locale)
      .order('step_order', { ascending: true });

    if (error) {
      console.error('[PROCESS] Supabase query error:', error);
      return NextResponse.json(
        {
          error:
            locale === 'ko'
              ? '장례 절차 정보를 불러오는 중 오류가 발생했습니다.'
              : 'Đã xảy ra lỗi khi tải thông tin quy trình tang lễ.',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Transform data to include title, description, images
    const steps = (data || []).map((item: any) => ({
      id: item.id,
      step_order: item.step_order,
      title: item.title,
      description: item.description,
      images: item.images || [],
    }));

    console.log('[PROCESS] Admin GET success:', {
      locale,
      count: steps.length,
    });

    return NextResponse.json({
      success: true,
      locale,
      steps,
    });
  } catch (error) {
    console.error('[PROCESS] Admin GET error:', error);
    const locale = searchParams.get('locale') || 'ko';
    return NextResponse.json(
      {
        error:
          locale === 'ko'
            ? '서버 오류가 발생했습니다.'
            : 'Đã xảy ra lỗi máy chủ.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - Save funeral steps with auto-translation
 */
export async function PUT(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get locale early for error messages
  let locale = 'ko';
  
  try {
    const body = await request.json();
    locale = body.locale || 'ko';
    const { steps } = body;

    // Validate locale
    if (!locale || (locale !== 'ko' && locale !== 'vi')) {
      return NextResponse.json(
        {
          error: 'Invalid locale. Must be "ko" or "vi"',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        {
          error:
            locale === 'ko'
              ? '절차 배열이 필요하며 비어있을 수 없습니다.'
              : 'Mảng bước là bắt buộc và không được để trống.',
        },
        { status: 400 }
      );
    }

    console.log('[PROCESS] Admin PUT request:', {
      locale,
      stepsCount: steps.length,
    });

    // Validate step structure
    for (const [index, step] of steps.entries()) {
      if (!step.title || !step.description) {
        return NextResponse.json(
          {
            error:
              locale === 'ko'
                ? `단계 ${index + 1}에 제목 또는 설명이 없습니다.`
                : `Bước ${index + 1} thiếu tiêu đề hoặc mô tả.`,
          },
          { status: 400 }
        );
      }
    }

    // Prepare steps for database
    const trimmedSteps = steps.map((step: any, index: number) => ({
      title: (step.title || '').trim(),
      description: (step.description || '').trim(),
      images: Array.isArray(step.images) ? step.images : [],
      step_order: index + 1,
    }));

    // Remove empty steps
    const validSteps = trimmedSteps.filter(
      (step) => step.title.length > 0 && step.description.length > 0
    );

    if (validSteps.length === 0) {
      return NextResponse.json(
        {
          error:
            locale === 'ko'
              ? '저장할 유효한 절차가 없습니다.'
              : 'Không có bước hợp lệ nào để lưu.',
        },
        { status: 400 }
      );
    }

    let koreanSteps: ProcessStep[] = [];
    let vietnameseSteps: ProcessStep[] = [];

    if (locale === 'ko') {
      // Save Korean steps
      koreanSteps = validSteps.map((step, index) => ({
        locale: 'ko' as const,
        step_order: index + 1,
        title: step.title,
        description: step.description,
        images: step.images,
      }));

      // Auto-translate Korean to Vietnamese
      console.log('[PROCESS] Translating Korean steps to Vietnamese...');
      try {
        vietnameseSteps = await Promise.all(
          validSteps.map(async (step, index) => {
            const [title_vi, description_vi] = await Promise.all([
              translateKRtoVI(step.title),
              translateKRtoVI(step.description),
            ]);

            return {
              locale: 'vi' as const,
              step_order: index + 1,
              title: title_vi,
              description: description_vi,
              images: step.images, // Images are shared
            };
          })
        );

        console.log('[PROCESS] Translation completed');
      } catch (translationError) {
        console.error('[PROCESS] Translation error:', translationError);
        return NextResponse.json(
          {
            error:
              locale === 'ko'
                ? '베트남어 번역에 실패했습니다.'
                : 'Dịch sang tiếng Việt thất bại.',
            details:
              translationError instanceof Error
                ? translationError.message
                : String(translationError),
          },
          { status: 500 }
        );
      }
    } else {
      // Save Vietnamese steps only
      vietnameseSteps = validSteps.map((step, index) => ({
        locale: 'vi' as const,
        step_order: index + 1,
        title: step.title,
        description: step.description,
        images: step.images,
      }));
    }

    // Delete existing records for the locale(s) before inserting new ones
    const localesToUpdate = locale === 'ko' ? ['ko', 'vi'] : ['vi'];
    
    for (const loc of localesToUpdate) {
      const { error: deleteError } = await supabase
        .from(FUNERAL_PROCESS_STEPS_TABLE)
        .delete()
        .eq('locale', loc);

      if (deleteError) {
        console.error(`[PROCESS] Delete error for ${loc}:`, deleteError);
        return NextResponse.json(
          {
            error:
              locale === 'ko'
                ? `기존 ${loc === 'ko' ? '한국어' : '베트남어'} 절차 삭제에 실패했습니다.`
                : `Xóa các bước ${loc === 'ko' ? 'tiếng Hàn' : 'tiếng Việt'} hiện có thất bại.`,
            details: deleteError.message,
          },
          { status: 500 }
        );
      }
    }

    // Insert new steps
    const allSteps = locale === 'ko' 
      ? [...koreanSteps, ...vietnameseSteps]
      : vietnameseSteps;

    const { data: insertedData, error: insertError } = await supabase
      .from(FUNERAL_PROCESS_STEPS_TABLE)
      .insert(allSteps)
      .select();

    if (insertError) {
      console.error('[PROCESS] Insert error:', insertError);
      return NextResponse.json(
        {
          error:
            locale === 'ko'
              ? '장례 절차 저장에 실패했습니다.'
              : 'Lưu quy trình tang lễ thất bại.',
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    console.log('[PROCESS] Admin PUT success:', {
      locale,
      insertedCount: insertedData?.length || 0,
    });

    return NextResponse.json({
      success: true,
      message:
        locale === 'ko'
          ? '장례 절차가 저장되었고, 베트남어 버전도 자동 번역되어 저장되었습니다.'
          : 'Quy trình tang lễ đã được lưu thành công.',
      count: insertedData?.length || 0,
      data: insertedData,
    });
  } catch (error) {
    console.error('[PROCESS] Admin PUT error:', error);
    // Use the locale variable defined at the top of the function
    return NextResponse.json(
      {
        error:
          locale === 'ko'
            ? '서버 오류가 발생했습니다.'
            : 'Đã xảy ra lỗi máy chủ.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
