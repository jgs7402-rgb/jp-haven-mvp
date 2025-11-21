import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { writeFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 업로드 디렉토리 확인
    await mkdir(UPLOAD_DIR, { recursive: true });
    
    const files = await readdir(UPLOAD_DIR);
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
    console.error('Error reading images:', error);
    return NextResponse.json({ error: 'Failed to read images' }, { status: 500 });
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
    await mkdir(UPLOAD_DIR, { recursive: true });

    // 파일명 생성
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${type}-${timestamp}.${extension}`;
    const filepath = join(UPLOAD_DIR, filename);

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

