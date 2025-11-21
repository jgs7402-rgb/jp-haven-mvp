import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CONTACTS_PATH = join(process.cwd(), 'data', 'contacts.json');

export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let raw: string;
    try {
      raw = await readFile(CONTACTS_PATH, 'utf-8');
    } catch (fileError) {
      // 파일이 없으면 빈 배열 반환
      console.warn('[CONTACTS] File not found, returning empty array');
      return NextResponse.json([], { status: 200 });
    }
    
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) {
      console.warn('[CONTACTS] Invalid data format, returning empty array');
      return NextResponse.json([], { status: 200 });
    }
    
    // 최신순 정렬
    items.sort(
      (a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    return NextResponse.json(items);
  } catch (error) {
    console.error('[CONTACTS] Admin read error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body as { id?: string; status?: string };

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    let raw: string;
    let items: any[];
    
    try {
      raw = await readFile(CONTACTS_PATH, 'utf-8');
      items = JSON.parse(raw);
      if (!Array.isArray(items)) {
        items = [];
      }
    } catch (fileError) {
      // 파일이 없으면 빈 배열로 시작
      console.warn('[CONTACTS] File not found, starting with empty array');
      items = [];
    }

    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    items[index].status = status;

    try {
      await writeFile(CONTACTS_PATH, JSON.stringify(items, null, 2), 'utf-8');
    } catch (writeError) {
      console.error('[CONTACTS] File write error:', writeError);
      return NextResponse.json(
        { error: 'Failed to save contact status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CONTACTS] Admin update error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact status' },
      { status: 500 }
    );
  }
}


