import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { translateKRtoVI } from '@/lib/translate';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FUNERAL_ITEMS_TABLE = 'funeral_items';

/**
 * PUT handler - Update funeral item with re-translation and manual override support
 */
export async function PUT(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      title_ko,
      description_ko,
      title_vi,
      description_vi,
      step_number,
      images,
      retranslate = false, // Flag to force re-translation
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Get existing item
    const { data: existingItem, error: fetchError } = await supabase
      .from(FUNERAL_ITEMS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json(
        { error: 'Funeral item not found' },
        { status: 404 }
      );
    }

    // Determine final values
    const finalTitleKo = title_ko !== undefined ? title_ko.trim() : existingItem.title_ko;
    const finalDescriptionKo =
      description_ko !== undefined
        ? description_ko.trim()
        : existingItem.description_ko;
    const finalStepNumber =
      step_number !== undefined ? parseInt(step_number) : existingItem.step_number;
    const finalImages = images !== undefined ? (Array.isArray(images) ? images : [images]) : existingItem.images;

    let finalTitleVi: string;
    let finalDescriptionVi: string;

    // Determine Vietnamese values
    if (retranslate || (title_ko !== undefined || description_ko !== undefined)) {
      // Re-translate if Korean was updated or retranslate flag is set
      console.log('[FUNERAL ITEMS UPDATE] Re-translating to Vietnamese...');
      try {
        [finalTitleVi, finalDescriptionVi] = await Promise.all([
          translateKRtoVI(finalTitleKo),
          translateKRtoVI(finalDescriptionKo),
        ]);
        console.log('[FUNERAL ITEMS UPDATE] Re-translation completed');
      } catch (translationError) {
        console.error('[FUNERAL ITEMS UPDATE] Translation error:', translationError);
        // Fall back to existing Vietnamese if translation fails
        finalTitleVi = existingItem.title_vi;
        finalDescriptionVi = existingItem.description_vi;
      }
    } else {
      // Use manual override if provided, otherwise keep existing
      finalTitleVi = title_vi !== undefined ? title_vi.trim() : existingItem.title_vi;
      finalDescriptionVi =
        description_vi !== undefined
          ? description_vi.trim()
          : existingItem.description_vi;
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from(FUNERAL_ITEMS_TABLE)
      .update({
        title_ko: finalTitleKo,
        title_vi: finalTitleVi,
        description_ko: finalDescriptionKo,
        description_vi: finalDescriptionVi,
        images: finalImages,
        step_number: finalStepNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[FUNERAL ITEMS UPDATE] Supabase update error:', error);
      return NextResponse.json(
        {
          error: 'Failed to update funeral item',
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log('[FUNERAL ITEMS UPDATE] Item updated successfully:', {
      id: data.id,
      step_number: data.step_number,
    });

    return NextResponse.json({
      success: true,
      message: 'Funeral item updated successfully',
      data,
    });
  } catch (error) {
    console.error('[FUNERAL ITEMS UPDATE] PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

