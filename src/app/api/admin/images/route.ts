import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { writeFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 업로드 디렉토리 확인
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (dirError) {
      console.warn('[IMAGES] Directory creation warning (ignored):', dirError);
    }
    
    let files: string[];
    try {
      files = await readdir(UPLOAD_DIR);
    } catch (readError) {
      console.error('[IMAGES] Directory read error:', readError);
      return NextResponse.json([], { status: 200 });
    }
    
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file, index) => {
        let type: 'hero' | 'cemetery' | 'contact' = 'cemetery';
        if (file.startsWith('hero-')) {
          type = 'hero';
        } else if (file.startsWith('contact-')) {
          type = 'contact';
        }
        return {
          id: String(index + 1),
          url: `/uploads/${file}`,
          type,
          createdAt: new Date().toISOString(),
        };
      });

    return NextResponse.json(images);
  } catch (error) {
    console.error('[IMAGES] Error reading images:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large (max 5MB)' },
        { status: 400 }
      );
    }

    // 업로드 디렉토리 생성
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (dirError) {
      console.warn('[IMAGES] Directory creation warning (ignored):', dirError);
    }

    // 파일명 생성
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${type}-${timestamp}.${extension}`;
    const filepath = join(UPLOAD_DIR, filename);

    // 파일 저장
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
    } catch (writeError) {
      console.error('[IMAGES] File write error:', writeError);
      return NextResponse.json(
        { error: 'Failed to save image file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error('[IMAGES] Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

