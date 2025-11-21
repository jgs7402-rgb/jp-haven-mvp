import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const HOTLINE_PATH = join(process.cwd(), 'data', 'hotline.json');

export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let data: string;
    try {
      data = await readFile(HOTLINE_PATH, 'utf-8');
    } catch (fileError) {
      // 파일이 없으면 기본값 반환
      console.warn('[HOTLINE] File not found, returning default values');
      return NextResponse.json({
        phone: '+82-00-0000-0000',
        hoursKo: '상담시간 08:00–21:00',
        hoursVi: 'Giờ tư vấn 08:00–21:00',
      }, { status: 200 });
    }
    
    const hotline = JSON.parse(data);
    return NextResponse.json(hotline);
  } catch (error) {
    console.error('[HOTLINE] Read error:', error);
    // 파싱 에러 시 기본값 반환
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

export async function PUT(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { phone, hoursKo, hoursVi } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone is required' },
        { status: 400 }
      );
    }

    const hotline = {
      phone,
      hoursKo: hoursKo || '상담시간 08:00–21:00',
      hoursVi: hoursVi || 'Giờ tư vấn 08:00–21:00',
    };

    try {
      await writeFile(HOTLINE_PATH, JSON.stringify(hotline, null, 2), 'utf-8');
      console.log('[HOTLINE] Updated:', hotline);
    } catch (writeError) {
      console.error('[HOTLINE] File write error:', writeError);
      return NextResponse.json(
        { error: 'Failed to save hotline data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[HOTLINE] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update hotline data' },
      { status: 500 }
    );
  }
}


