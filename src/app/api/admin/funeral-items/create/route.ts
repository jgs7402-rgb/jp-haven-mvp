import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { translateKRtoVI } from '@/lib/translate';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FUNERAL_ITEMS_TABLE = 'funeral_items';

/**
 * POST handler - Create new funeral item with automatic translation
 */
export async function POST(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title_ko, description_ko, title_vi, description_vi, step_number, images } = body;

    // Validation
    if (!title_ko || title_ko.trim().length === 0) {
      return NextResponse.json(
        { error: 'Korean title is required' },
        { status: 400 }
      );
    }

    if (!description_ko || description_ko.trim().length === 0) {
      return NextResponse.json(
        { error: 'Korean description is required' },
        { status: 400 }
      );
    }

    if (step_number === undefined || step_number === null) {
      return NextResponse.json(
        { error: 'Step number is required' },
        { status: 400 }
      );
    }

    // Validate images array
    const imageUrls = Array.isArray(images) ? images : images ? [images] : [];

    console.log('[FUNERAL ITEMS CREATE] Creating new item:', {
      title_ko: title_ko.substring(0, 50) + '...',
      description_ko_length: description_ko.length,
      step_number,
      images_count: imageUrls.length,
    });

    // Translate Korean to Vietnamese using OpenAI (if not provided manually)
    let finalTitleVi: string;
    let finalDescriptionVi: string;

    if (title_vi && description_vi) {
      // Use manual Vietnamese values if provided
      finalTitleVi = title_vi.trim();
      finalDescriptionVi = description_vi.trim();
      console.log('[FUNERAL ITEMS CREATE] Using manual Vietnamese values');
    } else {
      // Auto-translate if not provided
      console.log('[FUNERAL ITEMS CREATE] Translating to Vietnamese...');
      try {
        [finalTitleVi, finalDescriptionVi] = await Promise.all([
          translateKRtoVI(title_ko),
          translateKRtoVI(description_ko),
        ]);

        console.log('[FUNERAL ITEMS CREATE] Translation completed:', {
          title_vi_length: finalTitleVi.length,
          description_vi_length: finalDescriptionVi.length,
        });
      } catch (translationError) {
        console.error('[FUNERAL ITEMS CREATE] Translation error:', translationError);
        return NextResponse.json(
          {
            error: 'Failed to translate content to Vietnamese',
            details:
              translationError instanceof Error
                ? translationError.message
                : String(translationError),
          },
          { status: 500 }
        );
      }
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from(FUNERAL_ITEMS_TABLE)
      .insert({
        title_ko: title_ko.trim(),
        title_vi: finalTitleVi,
        description_ko: description_ko.trim(),
        description_vi: finalDescriptionVi,
        images: imageUrls.length > 0 ? imageUrls : [],
        step_number: parseInt(step_number),
      })
      .select()
      .single();

    if (error) {
      console.error('[FUNERAL ITEMS CREATE] Supabase insert error:', error);
      return NextResponse.json(
        {
          error: 'Failed to save funeral item',
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log('[FUNERAL ITEMS CREATE] Item created successfully:', {
      id: data.id,
      title_ko: data.title_ko.substring(0, 50) + '...',
      step_number: data.step_number,
    });

    return NextResponse.json({
      success: true,
      message: 'Funeral item created successfully',
      data,
    });
  } catch (error) {
    console.error('[FUNERAL ITEMS CREATE] POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

