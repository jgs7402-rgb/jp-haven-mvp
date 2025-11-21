import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'ko';

  try {
    const filePath = join(process.cwd(), 'data', `process.${locale}.json`);
    const data = await readFile(filePath, 'utf-8');
    const steps = JSON.parse(data);
    return NextResponse.json({ steps });
  } catch (error) {
    console.error('[PROCESS] Read error:', error);
    return NextResponse.json({ steps: [] }, { status: 200 });
  }
}


