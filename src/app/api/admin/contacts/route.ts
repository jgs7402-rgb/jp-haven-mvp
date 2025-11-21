import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const CONTACTS_PATH = join(process.cwd(), 'data', 'contacts.json');

export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const raw = await readFile(CONTACTS_PATH, 'utf-8');
    const items = JSON.parse(raw);
    // 최신순 정렬
    items.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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

    const raw = await readFile(CONTACTS_PATH, 'utf-8');
    const items = JSON.parse(raw) as any[];

    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    items[index].status = status;

    await writeFile(CONTACTS_PATH, JSON.stringify(items, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CONTACTS] Admin update error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact status' },
      { status: 500 }
    );
  }
}


