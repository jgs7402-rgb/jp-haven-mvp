import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const REGIONS_PATH = join(process.cwd(), 'data', 'regions.json');

export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await readFile(REGIONS_PATH, 'utf-8');
    const regions = JSON.parse(data);
    return NextResponse.json(regions);
  } catch (error) {
    console.error('[REGIONS] Read error:', error);
    return NextResponse.json({ error: 'Failed to read regions' }, { status: 500 });
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

    await writeFile(REGIONS_PATH, JSON.stringify(regions, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[REGIONS] Write error:', error);
    return NextResponse.json(
      { error: 'Failed to save regions' },
      { status: 500 }
    );
  }
}

