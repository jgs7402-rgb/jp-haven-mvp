import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const REGIONS_PATH = join(process.cwd(), 'data', 'regions.json');

export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let data: string;
    try {
      data = await readFile(REGIONS_PATH, 'utf-8');
    } catch (fileError) {
      console.error('[REGIONS] File not found:', fileError);
      return NextResponse.json(
        { error: 'Regions file not found' },
        { status: 404 }
      );
    }
    
    const regions = JSON.parse(data);
    return NextResponse.json(regions);
  } catch (error) {
    console.error('[REGIONS] Read error:', error);
    return NextResponse.json(
      { error: 'Failed to read regions' },
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
    const { regions } = body;

    if (!regions) {
      return NextResponse.json(
        { error: 'Regions data is required' },
        { status: 400 }
      );
    }

    try {
      await writeFile(REGIONS_PATH, JSON.stringify(regions, null, 2), 'utf-8');
    } catch (writeError) {
      console.error('[REGIONS] File write error:', writeError);
      return NextResponse.json(
        { error: 'Failed to save regions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[REGIONS] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update regions' },
      { status: 500 }
    );
  }
}

