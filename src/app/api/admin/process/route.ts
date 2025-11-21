import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'ko';

  try {
    const filePath = join(process.cwd(), 'data', `process.${locale}.json`);
    const data = await readFile(filePath, 'utf-8');
    const steps = JSON.parse(data);
    return NextResponse.json({ steps });
  } catch (error) {
    console.error('[PROCESS] Admin read error:', error);
    return NextResponse.json({ steps: [] }, { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { locale, steps } = body as { locale?: string; steps?: string[] };

    if (!locale || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: 'Locale and steps are required' },
        { status: 400 }
      );
    }

    const trimmedSteps = steps
      .map((s) => (s || '').trim())
      .filter((s) => s.length > 0);

    const filePath = join(process.cwd(), 'data', `process.${locale}.json`);
    await writeFile(filePath, JSON.stringify(trimmedSteps, null, 2), 'utf-8');

    console.log('[PROCESS] Admin updated:', { locale, count: trimmedSteps.length });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PROCESS] Admin update error:', error);
    return NextResponse.json(
      { error: 'Failed to update process steps' },
      { status: 500 }
    );
  }
}


