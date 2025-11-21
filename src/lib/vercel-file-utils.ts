import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Vercel 환경인지 확인
 */
export function isVercelEnvironment(): boolean {
  return process.env.VERCEL === '1' || !!process.env.VERCEL_ENV;
}

/**
 * 데이터 디렉토리 경로 가져오기
 * - Vercel: /tmp/data (임시 저장소, 영구적이지 않음)
 * - 로컬: process.cwd()/data
 */
export function getDataDirectory(): string {
  const isVercel = isVercelEnvironment();
  return isVercel 
    ? '/tmp/data'  // Vercel에서는 /tmp 디렉토리 사용
    : join(process.cwd(), 'data');  // 로컬에서는 프로젝트 루트의 data 디렉토리 사용
}

/**
 * 파일 경로 생성
 */
export function getDataFilePath(filename: string): string {
  return join(getDataDirectory(), filename);
}

/**
 * 디렉토리 생성 (없으면 생성)
 */
export async function ensureDataDirectory(): Promise<void> {
  const dataDir = getDataDirectory();
  try {
    await mkdir(dataDir, { recursive: true });
  } catch (dirError) {
    const dirErrorMessage = dirError instanceof Error ? dirError.message : String(dirError);
    console.warn('[FILE] Directory creation warning (ignored):', dirErrorMessage);
    // 디렉토리가 이미 존재하면 무시
  }
}

/**
 * Vercel 환경에 맞춰 안전하게 파일 쓰기
 * @param filepath 파일 경로
 * @param content 파일 내용
 * @returns 성공 여부와 에러 메시지
 */
export async function safeWriteFile(
  filepath: string, 
  content: string
): Promise<{ success: boolean; error?: string; warning?: string }> {
  const isVercel = isVercelEnvironment();
  
  try {
    // 디렉토리 확인
    await ensureDataDirectory();
    
    // 파일 쓰기
    await writeFile(filepath, content, 'utf-8');
    return { success: true };
  } catch (writeError) {
    const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);
    const errorStack = writeError instanceof Error ? writeError.stack : undefined;
    
    console.error('[FILE] File write error:', { 
      message: errorMessage, 
      stack: errorStack,
      filepath,
      isVercel
    });
    
    // Vercel 환경에서 파일 쓰기 실패는 예상된 동작일 수 있음
    if (isVercel) {
      console.warn('[FILE] Vercel 환경에서 파일 쓰기 실패 (예상된 동작일 수 있음)');
      return { 
        success: false, 
        error: errorMessage,
        warning: 'Vercel 환경에서는 파일 시스템이 읽기 전용입니다. 데이터를 영구 저장하려면 Git에 커밋하거나 외부 스토리지를 사용하세요.'
      };
    }
    
    // 로컬 환경에서는 에러 반환
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * 파일 읽기 (파일이 없으면 기본값 반환)
 */
export async function safeReadFile<T>(
  filepath: string,
  defaultValue: T
): Promise<T> {
  try {
    const data = await readFile(filepath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (fileError) {
    console.warn('[FILE] File read error, returning default value:', filepath);
    return defaultValue;
  }
}

