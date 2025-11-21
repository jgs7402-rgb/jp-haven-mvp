import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FOOTER_PATH = join(process.cwd(), 'data', 'footer.json');

export async function GET() {
  try {
    const data = await readFile(FOOTER_PATH, 'utf-8');
    const footer = JSON.parse(data);
    return NextResponse.json(footer);
  } catch (error) {
    console.error('[FOOTER] Read error:', error);
    return NextResponse.json(
      {
        companyName: 'JP Haven',
        copyrightKo: '모든 권리 보유',
        copyrightVi: 'Bảo lưu mọi quyền',
      },
      { status: 200 }
    );
  }
}

