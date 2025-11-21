import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const REGIONS_PATH = join(process.cwd(), 'data', 'regions.json');

export async function GET() {
  try {
    const data = await readFile(REGIONS_PATH, 'utf-8');
    const regions = JSON.parse(data);
    return NextResponse.json(regions);
  } catch (error) {
    console.error('[REGIONS] Public read error:', error);
    return NextResponse.json({ error: 'Failed to read regions' }, { status: 500 });
  }
}

