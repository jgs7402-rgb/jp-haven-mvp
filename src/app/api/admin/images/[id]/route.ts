import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';

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
    const files = await readdir(UPLOAD_DIR).catch(() => []);
    const imageIndex = parseInt(id) - 1;
    const filename = files.filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))[imageIndex];

    if (!filename) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const filepath = join(UPLOAD_DIR, filename);
    await unlink(filepath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

