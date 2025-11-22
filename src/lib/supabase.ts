import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// ========================================
// Lazy Supabase Client Initialization
// ========================================
// This function creates and returns a Supabase client when called.
// It throws errors only when the function is invoked, not at module import time.
// This prevents build failures when environment variables are not set.

let cachedClient: SupabaseClient | null = null;

/**
 * Gets or creates a Supabase client instance
 * @throws Error if required environment variables are missing
 * @returns SupabaseClient instance
 */
export function getSupabaseClient(): SupabaseClient {
  // Return cached client if already created
  if (cachedClient) {
    return cachedClient;
  }

  // ========================================
  // 환경 변수 읽기 (명시적으로 분리)
  // ========================================
  // URL은 오직 NEXT_PUBLIC_SUPABASE_URL에서만 읽음
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // 키는 각각 독립적으로 읽음 (URL과 혼동 방지)
  // anonKey는 URL이 아니라 key(두 번째 인자)로만 사용됨
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 디버깅: 환경 변수 로드 확인 (빌드 로그에 표시)
  console.log('[SUPABASE] Environment variables loaded:', {
    hasUrl: !!rawUrl,
    urlType: typeof rawUrl,
    urlPrefix: rawUrl ? rawUrl.substring(0, 30) + '...' : 'undefined',
    urlLength: rawUrl ? rawUrl.length : 0,
    hasServiceRoleKey: !!serviceRoleKey,
    serviceRoleKeyPrefix: serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'undefined',
    hasAnonKey: !!anonKey,
    anonKeyPrefix: anonKey ? anonKey.substring(0, 20) + '...' : 'undefined',
  });

  // ========================================
  // URL 검증 (rawUrl은 오직 URL만 허용)
  // ========================================

  // URL 검증 1: 필수 확인
  if (!rawUrl) {
    console.error('[SUPABASE] NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
    throw new Error('Supabase URL is missing. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.');
  }

  // URL 검증 2: 키 값이 URL 변수에 설정되지 않았는지 확인 (가장 먼저 확인)
  // anonKey나 secret key가 rawUrl에 들어가는 것을 방지
  // sb_publishable_, sb_secret_ 등으로 시작하는 값은 키이므로 URL이 아님
  if (
    rawUrl.startsWith('sb_publishable_') ||
    rawUrl.startsWith('sb_secret_') ||
    rawUrl.startsWith('eyJ') || // JWT 토큰으로 시작하는 경우
    (rawUrl.length > 0 && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://') && rawUrl.length > 50) // 긴 문자열이면서 URL 형식이 아닌 경우
  ) {
    console.error('[SUPABASE] ❌ NEXT_PUBLIC_SUPABASE_URL에 키 값이 설정되어 있습니다!');
    console.error('[SUPABASE] 감지된 값:', rawUrl.substring(0, 50) + (rawUrl.length > 50 ? '...' : ''));
    console.error('[SUPABASE]');
    console.error('[SUPABASE] 🔍 환경 변수 설정 확인:');
    console.error('[SUPABASE]   ✅ NEXT_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL이어야 함');
    console.error('[SUPABASE]      올바른 예: https://xxxxx.supabase.co');
    console.error('[SUPABASE]      잘못된 예: sb_publishable_... (이것은 키입니다)');
    console.error('[SUPABASE]   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Publishable key');
    console.error('[SUPABASE]      예: sb_publishable_7ZFQBg7FL2X5OvaoPwes9g_mmf2yIiq');
    console.error('[SUPABASE]   ✅ SUPABASE_SERVICE_ROLE_KEY: Secret key');
    console.error('[SUPABASE]      예: sb_secret_...');
    console.error('[SUPABASE]');
    console.error('[SUPABASE] 💡 해결 방법:');
    console.error('[SUPABASE]   1. Vercel Dashboard → Settings → Environment Variables');
    console.error('[SUPABASE]   2. NEXT_PUBLIC_SUPABASE_URL에는 실제 Supabase 프로젝트 URL만 설정');
    console.error('[SUPABASE]   3. 키는 NEXT_PUBLIC_SUPABASE_ANON_KEY 또는 SUPABASE_SERVICE_ROLE_KEY에 설정');
    console.error('[SUPABASE]');
    throw new Error(
      `Invalid Supabase URL: The value appears to be an API key (starts with "sb_publishable_" or "sb_secret_"), not a URL. ` +
      `Please check that NEXT_PUBLIC_SUPABASE_URL contains the actual Supabase project URL (e.g., https://xxxxx.supabase.co), not the API key. ` +
      `The API key should be set in NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY instead.`
    );
  }

  // URL 검증 3: http:// 또는 https://로 시작하는지 확인
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    console.error('[SUPABASE] Invalid NEXT_PUBLIC_SUPABASE_URL 값:', rawUrl);
    console.error('[SUPABASE] URL은 http:// 또는 https://로 시작해야 합니다.');
    throw new Error(`Invalid Supabase URL: "${rawUrl}". Must start with http:// or https://`);
  }

  // URL 검증 4: URL이 실제 Supabase 도메인 형식인지 확인 (선택적 검증, 경고만)
  if (!rawUrl.includes('.supabase.co') && !rawUrl.includes('.supabase.in')) {
    console.warn('[SUPABASE] ⚠️ URL이 Supabase 도메인 형식이 아닐 수 있습니다:', rawUrl);
    // 경고만 표시하고 에러는 throw하지 않음 (자체 호스팅 등의 경우를 위해)
  }

  // ========================================
  // 키 검증 및 선택 (anonKey와 serviceRoleKey는 키로만 사용)
  // ========================================

  // 키 선택: 서비스 역할 키 우선, 없으면 anon key 사용
  // anonKey는 URL이 아니라 createClient의 두 번째 인자로만 사용됨
  if (!serviceRoleKey && !anonKey) {
    console.error('[SUPABASE] SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
    throw new Error('Supabase key is missing. Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.');
  }

  // 키 검증: 키가 URL로 잘못 설정되었는지 확인 (http:// 또는 https://로 시작)
  const selectedKey = serviceRoleKey || anonKey;
  if (selectedKey && (selectedKey.startsWith('http://') || selectedKey.startsWith('https://'))) {
    console.error('[SUPABASE] 잘못된 키 값이 URL 형식입니다:', selectedKey.substring(0, 50) + '...');
    console.error('[SUPABASE] 키는 URL이 아닌 문자열이어야 합니다 (예: sb_publishable_... 또는 sb_secret_...)');
    throw new Error('Invalid Supabase key: appears to be a URL. Check that SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is correctly set.');
  }

  // placeholder 값 확인
  const placeholderPatterns = [
    'your-anon-key-here',
    'your-service-role-key-here',
    'https://your-project.supabase.co',
  ];

  for (const pattern of placeholderPatterns) {
    if (rawUrl.includes(pattern)) {
      console.error('[SUPABASE] NEXT_PUBLIC_SUPABASE_URL에 placeholder 값이 포함되어 있습니다:', pattern);
      throw new Error(`Invalid Supabase URL: contains placeholder "${pattern}". Please set a valid NEXT_PUBLIC_SUPABASE_URL.`);
    }
    
    if (selectedKey && selectedKey.includes(pattern)) {
      console.error('[SUPABASE] Supabase 키에 placeholder 값이 포함되어 있습니다:', pattern);
      throw new Error(`Invalid Supabase key: contains placeholder "${pattern}". Please set a valid SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.`);
    }
  }

  // ========================================
  // Supabase 클라이언트 생성
  // ========================================
  // URL은 rawUrl에서만 가져오고, 키는 serviceRoleKey || anonKey 사용
  // rawUrl은 검증을 모두 통과한 URL이고,
  // selectedKey는 serviceRoleKey || anonKey로, URL이 아닌 키 값만 사용됨
  // 이 시점에서 selectedKey는 반드시 정의되어 있음 (위의 검증 로직에서 확인됨)
  cachedClient = createClient(rawUrl, selectedKey!, {
    auth: {
      persistSession: false, // 서버 사이드에서는 세션 유지하지 않음
    },
  });

  return cachedClient;
}

// ========================================
// Legacy export for backward compatibility
// ========================================
// This is a getter that lazily creates the client only when accessed.
// It throws when accessed if env vars are missing, not at import time.
// This allows existing code to continue working while new code should use getSupabaseClient().
let _supabaseInstance: SupabaseClient | undefined;

function getSupabaseInstance(): SupabaseClient {
  if (!_supabaseInstance) {
    _supabaseInstance = getSupabaseClient();
  }
  return _supabaseInstance;
}

// Export as an object with Proxy to handle property access
// This ensures no code runs at module import time
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    // Only execute when a property is accessed, not at import time
    const client = getSupabaseInstance();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return (...args: any[]) => value.apply(client, args);
    }
    return value;
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
