import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ url: null });
    }
    
    const files = await readdir(UPLOAD_DIR).catch(() => []);
    const contactImage = files
      .filter((file) => file.startsWith('contact-'))
      .sort()
      .reverse()[0]; // 가장 최근 이미지

    if (contactImage) {
      return NextResponse.json({ url: `/uploads/${contactImage}` });
    }

    return NextResponse.json({ url: null });
  } catch (error) {
    return NextResponse.json({ url: null });
  }
}

