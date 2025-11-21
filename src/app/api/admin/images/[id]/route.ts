import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // 이미지 목록에서 URL 찾기
    let files: string[];
    try {
      files = await readdir(UPLOAD_DIR);
    } catch (readError) {
      console.error('[IMAGES] Directory read error:', readError);
      return NextResponse.json(
        { error: 'Failed to read images directory' },
        { status: 500 }
      );
    }
    
    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    const imageIndex = parseInt(id) - 1;
    
    if (imageIndex < 0 || imageIndex >= imageFiles.length) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    const filename = imageFiles[imageIndex];
    const filepath = join(UPLOAD_DIR, filename);

    try {
      await unlink(filepath);
    } catch (unlinkError) {
      console.error('[IMAGES] File delete error:', unlinkError);
      return NextResponse.json(
        { error: 'Failed to delete image file' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[IMAGES] Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

