import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSession, setSessionCookieInResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] 로그인 요청 수신');
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[API] JSON 파싱 실패:', parseError);
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    const { username, password } = body;
    console.log('[API] 로그인 시도:', { username, hasPassword: !!password });

    // 입력값 검증
    if (!username || !password) {
      console.log('[API] 입력값 누락');
      return NextResponse.json(
        { error: '아이디와 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 인증 확인
    const isValid = await verifyCredentials(username, password);
    console.log('[API] 인증 결과:', isValid);
    
    if (!isValid) {
      console.log('[API] 인증 실패');
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 세션 토큰 생성
    const token = await createSession();
    console.log('[API] 세션 토큰 생성 완료, 길이:', token.length);
    
    // 응답 생성 및 쿠키 설정
    const response = NextResponse.json({ success: true });
    const finalResponse = setSessionCookieInResponse(response, token);
    
    console.log('[API] 쿠키 설정 완료, 응답 반환');
    return finalResponse;
  } catch (error) {
    console.error('[API] 로그인 오류:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

