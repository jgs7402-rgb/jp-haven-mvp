# Vercel 환경 변수 설정 가이드

## 현재 문제 상황

빌드 로그에서 다음 문제가 발견되었습니다:

```
[SUPABASE] Environment variables loaded: {
  urlPrefix: 'sb_publishable_7ZFQBg7FL2X5Ova...',  // ❌ 키 값이 URL에 설정됨
  anonKeyPrefix: 'sb_secret_EA1KZomeB2...'         // ❌ Secret key가 anon key에 설정됨
}
```

## 올바른 환경 변수 설정 방법

### 1. Vercel Dashboard 접속

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 메뉴로 이동

### 2. 환경 변수 확인 및 수정

다음 환경 변수들이 올바르게 설정되어 있는지 확인하세요:

#### ✅ NEXT_PUBLIC_SUPABASE_URL
- **값**: Supabase 프로젝트 URL
- **형식**: `https://xxxxx.supabase.co`
- **예시**: `https://abcdefghijklmnop.supabase.co`
- **❌ 잘못된 예시**: `sb_publishable_...` (이것은 키입니다!)

#### ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- **값**: Supabase Publishable (anon) key
- **형식**: `sb_publishable_...`로 시작
- **예시**: `sb_publishable_7ZFQBg7FL2X5OvaoPwes9g_mmf2yIiq`
- **❌ 잘못된 예시**: `sb_secret_...` (이것은 secret key입니다!)

#### ✅ SUPABASE_SERVICE_ROLE_KEY (선택사항, 권장)
- **값**: Supabase Service Role (secret) key
- **형식**: `sb_secret_...`로 시작
- **예시**: `sb_secret_EA1KZomeB2...`
- **참고**: 이 키는 서버 사이드에서만 사용되며, 더 많은 권한을 가집니다.

### 3. Supabase Dashboard에서 올바른 값 확인

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Settings** → **API** 메뉴로 이동
4. 다음 정보 확인:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 사용
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용
   - **service_role key** (Secret): `SUPABASE_SERVICE_ROLE_KEY`에 사용

### 4. 환경 변수 수정 방법

#### 현재 잘못 설정된 경우:

1. **NEXT_PUBLIC_SUPABASE_URL**에 키 값이 들어가 있는 경우:
   - 기존 값 삭제
   - Supabase Dashboard에서 **Project URL** 복사
   - 새 값으로 설정

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**에 secret key가 들어가 있는 경우:
   - 기존 값 삭제
   - Supabase Dashboard에서 **anon/public key** 복사
   - 새 값으로 설정

3. **SUPABASE_SERVICE_ROLE_KEY**가 설정되지 않은 경우 (선택사항):
   - Supabase Dashboard에서 **service_role key** 복사
   - 새 환경 변수로 추가

### 5. 환경 변수 적용

1. 환경 변수 수정 후 **Save** 클릭
2. **Redeploy** 버튼 클릭하여 새 빌드 실행
3. 빌드 로그에서 다음 메시지 확인:
   ```
   [SUPABASE] Environment variables loaded: {
     urlPrefix: 'https://xxxxx.supabase.co...',  // ✅ 올바른 URL
     anonKeyPrefix: 'sb_publishable_...'         // ✅ 올바른 키
   }
   ```

## 빠른 체크리스트

- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co` 형식
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_...` 형식
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `sb_secret_...` 형식 (선택사항)
- [ ] 모든 환경 변수가 올바른 값으로 설정됨
- [ ] 환경 변수 저장 후 Redeploy 실행

## 문제 해결

### 빌드가 계속 실패하는 경우

1. **환경 변수 값 확인**: Vercel Dashboard에서 각 환경 변수의 실제 값을 확인
2. **Supabase Dashboard 확인**: Supabase에서 올바른 값 복사
3. **캐시 클리어**: Vercel에서 환경 변수 수정 후 Redeploy
4. **빌드 로그 확인**: 빌드 로그의 `[SUPABASE] Environment variables loaded:` 메시지 확인

### 여전히 문제가 있는 경우

빌드 로그의 `[SUPABASE] Environment variables loaded:` 부분을 확인하고:
- `urlPrefix`가 `https://`로 시작하는지 확인
- `anonKeyPrefix`가 `sb_publishable_`로 시작하는지 확인
- `serviceRoleKeyPrefix`가 `sb_secret_`로 시작하는지 확인 (설정된 경우)

