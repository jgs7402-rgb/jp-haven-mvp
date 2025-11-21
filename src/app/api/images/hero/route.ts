import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ url: null });
    }
    
    const files = await readdir(UPLOAD_DIR).catch(() => []);
    const heroImage = files
      .filter((file) => file.startsWith('hero-'))
      .sort()
      .reverse()[0]; // 가장 최근 이미지

    if (heroImage) {
      return NextResponse.json({ url: `/uploads/${heroImage}` });
    }

    return NextResponse.json({ url: null });
  } catch (error) {
    return NextResponse.json({ url: null });
  }
}

