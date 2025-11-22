import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { uploadMultipleImagesToStorage } from '@/lib/supabaseStorage';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST handler - Upload multiple images to Supabase Storage
 */
export async function POST(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log('[UPLOAD IMAGES] Uploading images:', files.length);

    // Upload all files to Supabase Storage
    const urls = await uploadMultipleImagesToStorage(
      files,
      'funeral-process'
    );

    console.log('[UPLOAD IMAGES] Upload successful:', urls.length);

    return NextResponse.json({
      success: true,
      urls,
    });
  } catch (error) {
    console.error('[UPLOAD IMAGES] Upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload images',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

