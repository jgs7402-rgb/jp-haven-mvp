import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 읽기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[SUPABASE] Supabase URL 또는 Anon Key가 설정되지 않았습니다.');
}

// Supabase 클라이언트 생성 (서버 사이드용)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: false, // 서버 사이드에서는 세션 유지하지 않음
    },
  }
);

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


