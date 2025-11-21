# 🔒 환경변수 및 보안 점검 결과

## 1. 발견된 환경변수 목록

### 클라이언트 노출 가능 (NEXT_PUBLIC_*)
다음 변수들은 빌드 시 번들에 포함되어 클라이언트에서 접근 가능합니다.

| 환경변수명 | 사용 위치 | 용도 | 보안 위험도 |
|-----------|----------|------|------------|
| `NEXT_PUBLIC_SITE_URL` | metadata.ts, layout.tsx, sitemap.ts, robots.ts, process/page.tsx, page.tsx | 사이트 기본 URL | ✅ 안전 |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | GoogleMap.tsx, cemeteries/[id]/page.tsx, CemeteryDetailModal.tsx | Google Maps 지도 표시 | ⚠️ 주의 (API 키 제한 필수) |

### 서버 전용 (비밀값)
다음 변수들은 서버 사이드에서만 사용되어야 합니다.

| 환경변수명 | 사용 위치 | 용도 | 필수 여부 |
|-----------|----------|------|----------|
| `SESSION_SECRET` | lib/auth.ts:8 | 세션 토큰 암호화 | ✅ 필수 |
| `ADMIN_USERNAME` 또는 `ADMIN_ID` | lib/auth.ts:12,40,58 | 어드민 계정 ID | ✅ 필수 |
| `ADMIN_PASSWORD` | lib/auth.ts:13,41,59,83,106 | 어드민 계정 비밀번호 | ✅ 필수 |
| `GOOGLE_MAPS_API_KEY` | api/geocode/route.ts:14 | 서버 사이드 지오코딩 | ✅ 필수 |
| `GOOGLE_TRANSLATE_API_KEY` | api/translate/route.ts:86 | Google Translate API | 선택 |
| `GOOGLE_SHEETS_WEBHOOK_URL` | api/contact/route.ts:52 | Google Sheets 연동 | 선택 |
| `EMAIL_API_KEY` | api/contact/route.ts:53 | 이메일 API 키 | 선택 |
| `EMAIL_TO` | api/contact/route.ts:54 | 수신 이메일 주소 | 선택 |
| `SMTP_HOST` | api/contact/route.ts:86 | SMTP 서버 주소 | 선택 |
| `SMTP_PORT` | api/contact/route.ts:87 | SMTP 포트 | 선택 |
| `SMTP_SECURE` | api/contact/route.ts:88 | SMTP 보안 연결 | 선택 |
| `SMTP_USER` | api/contact/route.ts:90 | SMTP 사용자명 | 선택 |
| `SMTP_PASS` | api/contact/route.ts:91 | SMTP 비밀번호 | 선택 |
| `EMAIL_FROM` | api/contact/route.ts:96 | 발신자 이메일 주소 | 선택 |
| `NODE_ENV` | lib/auth.ts:222 | 환경 모드 (production/development) | 자동 설정 |

### ⚠️ 보안 위험 발견

#### 1. GOOGLE_TRANSLATE_API_KEY가 NEXT_PUBLIC_으로도 사용 가능
**위치**: `src/app/api/translate/route.ts:86`
```typescript
const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
```

**문제점**: 
- `NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY`는 클라이언트에 노출됨
- Google Translate API 키는 서버에서만 사용해야 함
- 클라이언트 노출 시 API 키 남용 가능

**권장 조치**: 
- `NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY` 사용 제거
- `GOOGLE_TRANSLATE_API_KEY`만 사용 (서버 전용)

#### 2. GOOGLE_MAPS_API_KEY가 NEXT_PUBLIC_으로도 사용 가능
**위치**: `src/app/api/geocode/route.ts:14`
```typescript
const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
```

**문제점**:
- 서버 사이드 API에서는 서버 전용 키 사용 권장
- 클라이언트 키와 서버 키를 분리하는 것이 보안상 안전

**권장 조치**:
- 서버 사이드에서는 `GOOGLE_MAPS_API_KEY`만 사용
- 클라이언트에서는 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 사용

---

## 2. 하드코딩 위험 요소

### 🔴 높은 위험도

#### 1. 세션 시크릿 키 기본값
**파일**: `src/lib/auth.ts:8`
```typescript
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';
```
**위험도**: 🔴 매우 높음
**문제점**: 기본값이 프로덕션에서 사용되면 세션 토큰이 예측 가능
**조치**: 환경 변수 필수 설정, 기본값 제거 또는 경고 추가

#### 2. 어드민 기본 계정 정보
**파일**: `src/lib/auth.ts:27,33,52,53,75,97,115`
```typescript
username: 'admin',
password: 'admin123',
```
**위험도**: 🔴 매우 높음
**문제점**: 기본 계정 정보가 노출되면 무단 접근 가능
**조치**: 환경 변수 필수 설정, 기본값 제거 또는 경고 추가

### 🟡 중간 위험도

#### 3. 이메일 주소 오타
**파일**: `src/app/api/contact/route.ts:54`
```typescript
const emailTo = process.env.EMAIL_TO || 'jgs7402@gamil.com';
```
**위험도**: 🟡 중간
**문제점**: 
- 이메일 주소 오타 (`gamil` → `gmail`)
- 하드코딩된 이메일 주소
**조치**: 오타 수정, 환경 변수 사용 권장

#### 4. 기본 URL 하드코딩
**파일**: 
- `src/app/[locale]/metadata.ts:11`
- `src/app/[locale]/layout.tsx:41`
- `src/app/[locale]/sitemap.ts:5`
- `src/app/robots.ts:4`
```typescript
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
```
**위험도**: 🟡 중간
**문제점**: 프로덕션에서 잘못된 URL 사용 가능
**조치**: 환경 변수 필수 설정 또는 프로덕션에서 에러 발생

#### 5. 로컬호스트 URL 하드코딩
**파일**:
- `src/app/[locale]/process/page.tsx:26`
- `src/app/[locale]/page.tsx:53`
```typescript
`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/process?locale=${locale}`
```
**위험도**: 🟡 중간
**문제점**: 프로덕션에서 로컬호스트 URL 사용 가능
**조치**: 환경 변수 필수 설정

### 🟢 낮은 위험도 (참고용)

#### 6. API 키 플레이스홀더 검증
**파일**: 
- `src/components/common/GoogleMap.tsx:100,104`
- `src/app/[locale]/cemeteries/[id]/page.tsx:132,133`
- `src/components/admin/CemeteryDetailModal.tsx:53`
```typescript
apiKey !== 'your_google_maps_api_key_here'
apiKey !== '여기에_실제_API_키_입력'
```
**위험도**: 🟢 낮음
**설명**: 플레이스홀더 값 검증은 정상적인 보안 조치

---

## 3. 추천 .env.example 내용

프로젝트 루트에 `.env.example` 파일을 생성하여 다음 내용을 포함하세요:

```env
# ============================================
# 필수 환경 변수 (반드시 설정)
# ============================================

# 사이트 URL (프로덕션 도메인)
# 예: https://jangji-website.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Google Maps API 키 (클라이언트 사이드 - 지도 표시용)
# Google Cloud Console에서 발급: https://console.cloud.google.com/google/maps-apis/credentials
# ⚠️ API 키 제한 설정 필수: HTTP 리퍼러 제한, Maps JavaScript API만 활성화
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Google Maps API 키 (서버 사이드 - 지오코딩용)
# ⚠️ 클라이언트 키와 별도로 관리 권장
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# 세션 보안 키 (최소 32자 이상의 랜덤 문자열)
# 생성 방법: openssl rand -base64 32
# ⚠️ 프로덕션에서 반드시 변경 필수!
SESSION_SECRET=your-very-long-random-secret-key-minimum-32-characters

# 어드민 계정 정보
# ⚠️ 프로덕션에서 반드시 변경 필수!
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_strong_password_here

# 또는 ADMIN_ID 사용 가능 (ADMIN_USERNAME과 동일)
# ADMIN_ID=your_admin_username

# ============================================
# 선택 환경 변수 (기능 사용 시 설정)
# ============================================

# Google Translate API 키 (서버 사이드 전용)
# ⚠️ NEXT_PUBLIC_ 접두사 사용 금지 (클라이언트 노출 위험)
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here

# Google Sheets Webhook URL (문의사항 자동 저장)
# Google Apps Script Webhook URL
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# 이메일 전송 설정 (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=장지 상담문의 <your_email@gmail.com>
EMAIL_TO=your_receiving_email@gmail.com

# 또는 이메일 API 사용 시
EMAIL_API_KEY=your_email_api_key

# ============================================
# 자동 설정 (수동 설정 불필요)
# ============================================

# NODE_ENV는 자동으로 설정됨 (development/production)
# NODE_ENV=production
```

### .env.example 파일 생성 명령어
```bash
# 프로젝트 루트에서 실행
cat > .env.example << 'EOF'
# 위의 내용 복사
EOF
```

---

## 4. 배포 환경별 환경변수 설정 방법

### A. Vercel 배포

#### 방법 1: Vercel 대시보드에서 설정 (권장)
1. Vercel 대시보드 접속: https://vercel.com
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 이동
4. 각 환경변수를 추가:
   - **Key**: 환경변수 이름 (예: `NEXT_PUBLIC_SITE_URL`)
   - **Value**: 실제 값
   - **Environment**: Production, Preview, Development 중 선택
5. **Save** 클릭

#### 방법 2: Vercel CLI로 설정
```bash
# Vercel CLI 설치
npm i -g vercel

# 환경변수 추가
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add SESSION_SECRET production
vercel env add ADMIN_USERNAME production
vercel env add ADMIN_PASSWORD production
# ... 나머지 변수들도 동일하게 추가

# 환경변수 확인
vercel env ls
```

#### 중요 사항
- `NEXT_PUBLIC_*` 변수는 **모든 환경**에 설정해야 함
- 환경변수 추가 후 **재배포** 필요
- Production 환경변수는 프로덕션 배포에만 적용

---

### B. Docker 배포

#### docker-compose.yml 예시
```yaml
version: '3.8'
services:
  jangji-website:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SITE_URL=https://your-domain.com
      - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
      - GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
      - ADMIN_USERNAME=${ADMIN_USERNAME}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - ./data:/app/data
```

#### .env.production 파일 생성
```bash
# 프로젝트 루트에 .env.production 파일 생성
# 위의 .env.example 내용을 복사하여 실제 값으로 채우기
```

#### Docker 실행
```bash
# 환경변수 파일로 실행
docker-compose up -d

# 또는 직접 환경변수 전달
docker run -p 3000:3000 \
  --env-file .env.production \
  -v $(pwd)/data:/app/data \
  jangji-website
```

---

### C. VPS/서버 배포 (PM2)

#### .env.production 파일 생성
```bash
# 서버에 .env.production 파일 생성
nano .env.production
# 위의 .env.example 내용을 복사하여 실제 값으로 채우기
```

#### PM2 ecosystem.config.js 예시
```javascript
module.exports = {
  apps: [{
    name: 'jangji-website',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      // 환경변수는 .env.production 파일에서 로드
    },
    env_file: '.env.production',
  }]
};
```

#### PM2로 실행
```bash
# dotenv-cli 설치
npm install -g dotenv-cli

# PM2로 실행
pm2 start ecosystem.config.js

# 또는 직접 실행
dotenv -e .env.production -- pm2 start npm --name "jangji-website" -- start
```

---

## 5. 보안 권장 사항

### ✅ 필수 조치

1. **세션 시크릿 키**
   - 최소 32자 이상의 랜덤 문자열 사용
   - 생성: `openssl rand -base64 32`
   - 환경 변수로 반드시 설정

2. **어드민 계정**
   - 기본 계정(`admin`/`admin123`) 절대 사용 금지
   - 강력한 비밀번호 사용 (최소 12자, 대소문자+숫자+특수문자)
   - 환경 변수로 설정

3. **Google Maps API 키**
   - API 키 제한 설정 필수
   - HTTP 리퍼러 제한: `https://your-domain.com/*`
   - 필요한 API만 활성화: Maps JavaScript API, Geocoding API

4. **Google Translate API 키**
   - `NEXT_PUBLIC_` 접두사 사용 금지
   - 서버 사이드에서만 사용
   - API 키 제한 설정

### ⚠️ 권장 조치

1. **환경 변수 검증**
   - 프로덕션 빌드 시 필수 환경 변수 확인
   - 누락 시 에러 발생하도록 설정

2. **로그 관리**
   - 민감한 정보(비밀번호, API 키) 로그 출력 금지
   - 프로덕션에서 `console.log` 제거 또는 로깅 레벨 조정

3. **HTTPS 사용**
   - 프로덕션에서는 반드시 HTTPS 사용
   - 쿠키 `secure` 옵션 활성화 (이미 구현됨)

---

## 6. 즉시 수정 필요 항목

### 우선순위 1 (보안 위험)
- [ ] `SESSION_SECRET` 환경 변수 설정 (기본값 제거)
- [ ] `ADMIN_USERNAME`, `ADMIN_PASSWORD` 환경 변수 설정 (기본값 제거)
- [ ] `src/app/api/translate/route.ts`에서 `NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY` 사용 제거

### 우선순위 2 (기능 오류)
- [ ] `src/app/api/contact/route.ts:54` 이메일 주소 오타 수정 (`gamil` → `gmail`)
- [ ] `NEXT_PUBLIC_SITE_URL` 환경 변수 필수 설정

### 우선순위 3 (권장)
- [ ] `.env.example` 파일 생성
- [ ] 환경 변수 검증 로직 추가

---

## 7. 환경변수 체크리스트

배포 전 다음 항목을 확인하세요:

- [ ] `NEXT_PUBLIC_SITE_URL` 설정 (프로덕션 도메인)
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 설정 (클라이언트용)
- [ ] `GOOGLE_MAPS_API_KEY` 설정 (서버용)
- [ ] `SESSION_SECRET` 설정 (32자 이상 랜덤 문자열)
- [ ] `ADMIN_USERNAME` 설정 (기본값 사용 금지)
- [ ] `ADMIN_PASSWORD` 설정 (강력한 비밀번호)
- [ ] Google Maps API 키 제한 설정 완료
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 프로덕션 환경에 모든 환경 변수 설정 완료

---

**보안 점검 완료일**: 2024년
**점검자**: AI Assistant
**다음 점검 권장일**: 배포 전 최종 확인

