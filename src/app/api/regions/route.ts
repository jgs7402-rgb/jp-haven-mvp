import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const REGIONS_PATH = join(process.cwd(), 'data', 'regions.json');

export async function GET() {
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
    console.error('[REGIONS] Public read error:', error);
    return NextResponse.json(
      { error: 'Failed to read regions' },
      { status: 500 }
    );
  }
}

