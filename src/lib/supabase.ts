import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 읽기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// URL 검증 및 에러 처리
if (!supabaseUrl) {
  console.error('[SUPABASE] NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
  throw new Error('Supabase URL is missing. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.');
}

// URL 형식 검증 (http:// 또는 https://로 시작하는지 확인)
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('[SUPABASE] Invalid NEXT_PUBLIC_SUPABASE_URL 값:', supabaseUrl);
  throw new Error(`Invalid Supabase URL: "${supabaseUrl}". Must start with http:// or https://`);
}

// 키 선택: 서비스 역할 키 우선, 없으면 anon key 사용
const supabaseKey = serviceRoleKey || anonKey;

if (!supabaseKey) {
  console.error('[SUPABASE] SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  throw new Error('Supabase key is missing. Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.');
}

// 키가 URL로 잘못 설정되었는지 확인 (http:// 또는 https://로 시작)
if (supabaseKey.startsWith('http://') || supabaseKey.startsWith('https://')) {
  console.error('[SUPABASE] 잘못된 키 값이 URL 형식입니다:', supabaseKey.substring(0, 50) + '...');
  throw new Error('Invalid Supabase key: appears to be a URL. Check that SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is correctly set.');
}

// placeholder 값 확인
const placeholderPatterns = [
  'your-anon-key-here',
  'your-service-role-key-here',
  'https://your-project.supabase.co',
];

for (const pattern of placeholderPatterns) {
  if (supabaseUrl.includes(pattern)) {
    console.error('[SUPABASE] NEXT_PUBLIC_SUPABASE_URL에 placeholder 값이 포함되어 있습니다:', pattern);
    throw new Error(`Invalid Supabase URL: contains placeholder "${pattern}". Please set a valid NEXT_PUBLIC_SUPABASE_URL.`);
  }
  
  if (supabaseKey.includes(pattern)) {
    console.error('[SUPABASE] Supabase 키에 placeholder 값이 포함되어 있습니다:', pattern);
    throw new Error(`Invalid Supabase key: contains placeholder "${pattern}". Please set a valid SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.`);
  }
}

// Supabase 클라이언트 생성 (서버 사이드용)
// 위의 검증을 모두 통과한 경우에만 생성
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // 서버 사이드에서는 세션 유지하지 않음
  },
});

// 테이블 타입 정의
export interface ProcessStep {
  id: string;
  locale: 'ko' | 'vi';
  step_order: number;
  text: string;
  created_at?: string;
  updated_at?: string;
}

// 테이블 이름
export const PROCESS_STEPS_TABLE = 'process_steps';
