import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const HOTLINE_PATH = join(process.cwd(), 'data', 'hotline.json');

export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await readFile(HOTLINE_PATH, 'utf-8');
    const hotline = JSON.parse(data);
    return NextResponse.json(hotline);
  } catch (error) {
    console.error('[HOTLINE] Read error:', error);
    return NextResponse.json(
      { error: 'Failed to read hotline data' },
      { status: 500 }
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

    await writeFile(HOTLINE_PATH, JSON.stringify(hotline, null, 2), 'utf-8');

    console.log('[HOTLINE] Updated:', hotline);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[HOTLINE] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update hotline data' },
      { status: 500 }
    );
  }
}


