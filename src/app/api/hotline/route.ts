import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const HOTLINE_PATH = join(process.cwd(), 'data', 'hotline.json');

export async function GET() {
  try {
    const data = await readFile(HOTLINE_PATH, 'utf-8');
    const hotline = JSON.parse(data);
    return NextResponse.json(hotline);
  } catch (error) {
    console.error('[HOTLINE] Public read error:', error);
    return NextResponse.json(
      {
        phone: '+82-00-0000-0000',
        hoursKo: '상담시간 08:00–21:00',
        hoursVi: 'Giờ tư vấn 08:00–21:00',
      },
      { status: 200 }
    );
  }
}


