import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 어드민 경로는 i18n 미들웨어를 건너뜀
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 경로 정보를 헤더에 추가 (레이아웃에서 사용)
    const response = NextResponse.next();
    response.headers.set('x-pathname', request.nextUrl.pathname);
    return response;
  }

  // 나머지는 i18n 미들웨어 적용
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(ko|vi)/:path*',
    '/admin/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

