import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const ADMIN_CONFIG_PATH = join(process.cwd(), 'data', 'admin.json');
const SESSION_COOKIE = 'admin_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

// 환경 변수 우선, 없으면 파일에서 읽기
async function getAdminConfig() {
  const envUsername = process.env.ADMIN_USERNAME || process.env.ADMIN_ID;
  const envPassword = process.env.ADMIN_PASSWORD;
  
  if (envUsername && envPassword) {
    return {
      username: envUsername,
      password: envPassword,
    };
  }
  
  try {
    const data = await readFile(ADMIN_CONFIG_PATH, 'utf-8');
    const config = JSON.parse(data);
    return {
      username: config.username || 'admin',
      password: config.password || 'admin123',
    };
  } catch {
    // 파일이 없으면 기본값 반환
    return {
      username: 'admin',
      password: 'admin123',
    };
  }
}

// API 라우트용 (동기)
function getAdminConfigSync() {
  const envUsername = process.env.ADMIN_USERNAME || process.env.ADMIN_ID;
  const envPassword = process.env.ADMIN_PASSWORD;
  
  if (envUsername && envPassword) {
    return {
      username: envUsername,
      password: envPassword,
    };
  }
  
  // 파일 읽기는 비동기이므로 기본값 반환
  return {
    username: 'admin',
    password: 'admin123',
  };
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const envUsername = process.env.ADMIN_USERNAME || process.env.ADMIN_ID;
  const envPassword = process.env.ADMIN_PASSWORD;
  
  console.log('[AUTH] verifyCredentials 호출:', { 
    username, 
    hasPassword: !!password,
    hasEnvUsername: !!envUsername,
    hasEnvPassword: !!envPassword 
  });
  
  // 환경 변수 확인 (환경 변수가 있으면 우선 확인)
  if (envUsername && envPassword) {
    const envMatch = username === envUsername && password === envPassword;
    console.log('[AUTH] 환경 변수 확인 결과:', envMatch);
    if (envMatch) {
      return true;
    }
  }
  
  // 파일에서 읽기
  let fileConfig;
  try {
    const data = await readFile(ADMIN_CONFIG_PATH, 'utf-8');
    fileConfig = JSON.parse(data);
    console.log('[AUTH] 파일에서 읽은 설정:', { 
      fileUsername: fileConfig.username, 
      hasFilePassword: !!fileConfig.password,
      passwordLength: fileConfig.password?.length || 0
    });
  } catch (error) {
    console.error('[AUTH] 파일 읽기 오류:', error);
    // 파일 읽기 실패 시 false 반환 (기본값 사용하지 않음)
    console.log('[AUTH] 파일 읽기 실패로 인증 실패');
    return false;
  }
  
  // 파일의 비밀번호 확인
  if (!fileConfig || !fileConfig.username || !fileConfig.password) {
    console.log('[AUTH] 파일 설정이 올바르지 않음');
    return false;
  }
  
  const fileMatch = username === fileConfig.username && password === fileConfig.password;
  console.log('[AUTH] 파일 확인 결과:', fileMatch, {
    usernameMatch: username === fileConfig.username,
    passwordMatch: password === fileConfig.password
  });
  
  return fileMatch;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const envPassword = process.env.ADMIN_PASSWORD;
  
  // 환경 변수 확인
  if (envPassword && password === envPassword) {
    return true;
  }
  
  // 파일에서 읽기
  let fileConfig;
  try {
    const data = await readFile(ADMIN_CONFIG_PATH, 'utf-8');
    fileConfig = JSON.parse(data);
  } catch {
    // 파일이 없으면 기본값 사용
    fileConfig = { username: 'admin', password: 'admin123' };
  }
  
  // 파일의 비밀번호 확인
  return password === fileConfig.password;
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string; message?: string }> {
  // 환경 변수 확인
  const envPassword = process.env.ADMIN_PASSWORD;
  
  // 파일에서 읽기
  let fileConfig;
  try {
    const data = await readFile(ADMIN_CONFIG_PATH, 'utf-8');
    fileConfig = JSON.parse(data);
  } catch {
    // 파일이 없으면 기본값 사용
    fileConfig = { username: 'admin', password: 'admin123' };
  }
  
  // 현재 비밀번호 확인 (환경 변수 또는 파일 중 하나라도 일치하면 OK)
  const envMatches = envPassword && envPassword === currentPassword;
  const fileMatches = fileConfig.password === currentPassword;
  
  if (!envMatches && !fileMatches) {
    return { success: false, error: '현재 비밀번호가 일치하지 않습니다.' };
  }
  
  // 새 비밀번호 유효성 검사
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: '새 비밀번호는 최소 6자 이상이어야 합니다.' };
  }
  
  // 현재 비밀번호와 새 비밀번호가 같으면 안됨
  if (currentPassword === newPassword) {
    return { success: false, error: '새 비밀번호는 현재 비밀번호와 달라야 합니다.' };
  }
  
  try {
    // 파일에 저장 (환경 변수가 있어도 파일에 저장)
    const newConfig = {
      username: fileConfig.username || 'admin',
      password: newPassword,
    };
    
    await writeFile(ADMIN_CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');
    
    console.log('[AUTH] 비밀번호 업데이트 완료 (파일)');
    
    // 환경 변수가 설정되어 있으면 안내 메시지 추가
    if (envPassword) {
      return { 
        success: true,
        error: undefined,
        message: '비밀번호가 파일에 저장되었습니다. 환경 변수(.env.local의 ADMIN_PASSWORD)도 수동으로 업데이트해주세요.'
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('[AUTH] 비밀번호 업데이트 오류:', error);
    return { success: false, error: '비밀번호 업데이트에 실패했습니다.' };
  }
}

export async function createSession(): Promise<string> {
  // 간단한 세션 토큰 생성 (프로덕션에서는 JWT 사용 권장)
  const token = Buffer.from(`${Date.now()}-${SESSION_SECRET}`).toString('base64');
  return token;
}

// 서버 컴포넌트용
export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    
    if (!session) {
      console.log('[AUTH] 세션 쿠키 없음');
      return false;
    }
    
    try {
      const decoded = Buffer.from(session.value, 'base64').toString('utf-8');
      const [timestamp] = decoded.split('-');
      const sessionAge = Date.now() - parseInt(timestamp);
      const isValid = sessionAge < 24 * 60 * 60 * 1000; // 24시간
      
      console.log('[AUTH] 세션 검증:', {
        hasSession: true,
        sessionAge: Math.floor(sessionAge / 1000 / 60), // 분 단위
        isValid
      });
      
      return isValid;
    } catch (decodeError) {
      console.error('[AUTH] 세션 디코딩 오류:', decodeError);
      return false;
    }
  } catch (error) {
    console.error('[AUTH] 세션 검증 오류:', error);
    return false;
  }
}

// API 라우트용
export function verifySessionFromRequest(request: NextRequest): boolean {
  const session = request.cookies.get(SESSION_COOKIE);
  if (!session) return false;
  
  try {
    const decoded = Buffer.from(session.value, 'base64').toString('utf-8');
    const [timestamp] = decoded.split('-');
    const sessionAge = Date.now() - parseInt(timestamp);
    return sessionAge < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function setSessionCookieInResponse(response: NextResponse, token: string): NextResponse {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60, // 24시간
      path: '/',
    };
    
    response.cookies.set(SESSION_COOKIE, token, cookieOptions);
    console.log('[AUTH] 쿠키 설정 완료:', {
      name: SESSION_COOKIE,
      tokenLength: token.length,
      options: cookieOptions
    });
    return response;
  } catch (error) {
    console.error('[AUTH] 쿠키 설정 오류:', error);
    return response;
  }
}

export function deleteSessionInResponse(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

