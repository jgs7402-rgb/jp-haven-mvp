import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Vercel 서버리스 환경에서 동적 렌더링 강제
// 항상 최신 데이터를 가져오도록 캐시 없이 처리
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'ko';

  try {
    // 원본 data 디렉토리에서 읽기 (Git에 커밋된 파일 또는 로컬 저장 파일)
    const filePath = join(process.cwd(), 'data', `process.${locale}.json`);
    const data = await readFile(filePath, 'utf-8');
    const steps = JSON.parse(data);
    
    console.log('[PROCESS] Public API read:', { locale, count: Array.isArray(steps) ? steps.length : 0, filePath });
    return NextResponse.json({ steps: Array.isArray(steps) ? steps : [] });
  } catch (error) {
    console.error('[PROCESS] Read error:', error);
    // 파일이 없거나 읽기 실패 시 빈 배열 반환 (상용 페이지가 깨지지 않도록)
    return NextResponse.json({ steps: [] }, { status: 200 });
  }
}


