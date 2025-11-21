# 🚀 배포 전 최종 점검 체크리스트

## 프로젝트 정보
- **프레임워크**: Next.js 14.2.0
- **언어**: TypeScript
- **스타일**: Tailwind CSS
- **다국어**: next-intl (한국어/베트남어)
- **주요 기능**: 장지 디렉터리, 어드민 패널, Google Maps 통합

---

## 1️⃣ 환경 변수 설정

### 필수 환경 변수 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# 프로젝트 루트에서 실행
touch .env.local
```

### 환경 변수 목록

#### 필수 (반드시 설정)
```env
# 사이트 URL (프로덕션 도메인으로 변경)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Google Maps API 키 (클라이언트 사이드)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key

# Google Maps API 키 (서버 사이드 - Geocoding용)
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key

# 세션 보안 키 (강력한 랜덤 문자열로 변경 필수!)
SESSION_SECRET=your-very-long-random-secret-key-minimum-32-characters

# 어드민 계정 (환경 변수로 설정하면 data/admin.json보다 우선)
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_strong_password_here
```

#### 선택 (기능 사용 시 설정)
```env
# Google Translate API (번역 기능 사용 시)
GOOGLE_TRANSLATE_API_KEY=your_translate_api_key

# 이메일 전송 (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=장지 상담문의 <your_email@gmail.com>
EMAIL_TO=your_receiving_email@gmail.com

# Google Sheets Webhook (문의사항 자동 저장)
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/your_script_id/exec

# Email API (대안)
EMAIL_API_KEY=your_email_api_key
```

### ⚠️ 주의사항
- `.env.local` 파일은 절대 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
- 프로덕션 환경(Vercel 등)에서는 환경 변수를 별도로 설정해야 합니다

---

## 2️⃣ 의존성 설치 및 검증

### 명령어 실행 순서

```bash
# 1. 프로젝트 디렉토리로 이동
cd "/Users/jopro/Library/Mobile Documents/com~apple~CloudDocs/tangle JP/jangji-website"

# 2. 의존성 설치 (최신 버전으로 업데이트)
npm install

# 3. 타입 체크
npx tsc --noEmit

# 4. 린트 검사
npm run lint

# 5. 프로덕션 빌드 테스트
npm run build

# 6. 프로덕션 모드로 로컬 테스트
npm start
```

### 예상 결과
- ✅ `npm install`: 의존성 설치 완료
- ✅ `tsc --noEmit`: 타입 에러 없음
- ✅ `npm run lint`: 린트 에러 없음 (또는 경고만 있음)
- ✅ `npm run build`: 빌드 성공, `.next` 폴더 생성
- ✅ `npm start`: http://localhost:3000 에서 정상 작동

---

## 3️⃣ 코드 품질 점검

### 🔴 제거해야 할 console.log (프로덕션)

다음 파일들에서 디버깅용 `console.log`를 제거하거나 로깅 레벨을 조정하세요:

#### 높은 우선순위 (보안 관련)
- `src/lib/auth.ts` (라인 145, 176, 186, 229) - 인증 관련 로그
- `src/app/api/admin/login/route.ts` (라인 6, 20, 24, 33, 36, 45, 51) - 로그인 로그

#### 중간 우선순위 (성능)
- `src/app/admin/dashboard/layout.tsx` (라인 10, 13, 16, 20) - 레이아웃 렌더링 로그
- `src/app/[locale]/cemeteries/[id]/page.tsx` (라인 139, 159, 172, 185, 187, 194, 201) - 지도 관련 로그
- `src/components/common/GoogleMap.tsx` (라인 75, 94, 112, 118, 130) - API 키 검증 로그

#### 낮은 우선순위 (유지 가능)
- 에러 로그 (`console.error`)는 유지해도 됨
- 동기화 로그 (`console.log('[SYNC]')`)는 운영 모니터링에 유용할 수 있음

### 🔴 하드코딩된 값 수정

#### 1. 세션 시크릿 키 (보안 위험!)
**파일**: `src/lib/auth.ts:8`
```typescript
// 현재
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

// 수정 필요: 환경 변수 필수로 변경하거나 더 강력한 기본값 사용
```

#### 2. 기본 어드민 계정 (보안 위험!)
**파일**: `src/lib/auth.ts:31-34, 52-54, 75, 97, 115`
```typescript
// 현재
username: 'admin',
password: 'admin123',

// 수정 필요: 프로덕션에서는 환경 변수 필수 사용
```

#### 3. 이메일 주소 오타
**파일**: `src/app/api/contact/route.ts:54`
```typescript
// 현재
const emailTo = process.env.EMAIL_TO || 'jgs7402@gamil.com'; // 오타: gamil -> gmail

// 수정 필요
const emailTo = process.env.EMAIL_TO || 'jgs7402@gmail.com';
```

#### 4. 기본 URL
**파일**: 
- `src/app/[locale]/metadata.ts:11`
- `src/app/[locale]/layout.tsx:41`
- `src/app/[locale]/sitemap.ts:5`
- `src/app/robots.ts:4`

```typescript
// 현재
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

// 수정 필요: 프로덕션 도메인으로 변경하거나 환경 변수 필수로
```

---

## 4️⃣ 다국어 점검

### 언어 스위치 확인
- ✅ `src/components/common/LanguageSwitcher.tsx` - 언어 전환 컴포넌트 존재
- ✅ `src/middleware.ts` - 라우팅 미들웨어 확인 필요

### 하드코딩된 문장 검사

#### 발견된 하드코딩 문장
1. **에러 메시지** (일부는 번역 파일에 있음)
   - `src/app/[locale]/cemeteries/page.tsx:179` - "검색 결과가 없습니다." / "Không tìm thấy kết quả."
   - `src/app/[locale]/cemeteries/page.tsx:137` - 에러 메시지

2. **번역 파일 확인**
   - ✅ `messages/ko.json` - 한국어 번역 존재
   - ✅ `messages/vi.json` - 베트남어 번역 존재

### 주요 페이지 언어 스위치 테스트
```bash
# 로컬에서 테스트
npm start

# 다음 URL들을 확인:
# - http://localhost:3000/ko (한국어)
# - http://localhost:3000/vi (베트남어)
# - http://localhost:3000/ko/cemeteries
# - http://localhost:3000/vi/cemeteries
# - 각 페이지에서 언어 전환 버튼 클릭 테스트
```

---

## 5️⃣ 데이터 파일 점검

### 필수 데이터 파일 확인
```bash
# 다음 파일들이 존재하는지 확인
ls -la data/
```

필수 파일:
- ✅ `data/admin.json` - 어드민 계정 (환경 변수 사용 시 선택)
- ✅ `data/cemeteries.ko.json` - 한국어 장지 데이터
- ✅ `data/cemeteries.vi.json` - 베트남어 장지 데이터
- ✅ `data/regions.json` - 지역 정보
- ✅ `data/hotline.json` - 핫라인 정보
- ✅ `data/footer.json` - 푸터 정보
- ✅ `data/process.ko.json` - 한국어 절차 정보
- ✅ `data/process.vi.json` - 베트남어 절차 정보

### 데이터 파일 백업
```bash
# 배포 전 데이터 백업
cp -r data/ data_backup_$(date +%Y%m%d)/
```

---

## 6️⃣ 보안 점검

### ⚠️ 필수 보안 설정

#### 1. 세션 시크릿 키
- [ ] `SESSION_SECRET` 환경 변수 설정 (최소 32자 이상의 랜덤 문자열)
- [ ] `src/lib/auth.ts`의 기본값 제거 또는 경고 추가

#### 2. 어드민 계정
- [ ] `ADMIN_USERNAME` 환경 변수 설정
- [ ] `ADMIN_PASSWORD` 환경 변수 설정 (강력한 비밀번호)
- [ ] `data/admin.json`의 기본 계정 정보 변경 또는 삭제

#### 3. API 키
- [ ] Google Maps API 키 제한 설정 (HTTP 리퍼러 제한)
- [ ] Google Maps API 키에 필요한 서비스만 활성화

#### 4. 파일 업로드
- [ ] `public/uploads/` 폴더 권한 확인
- [ ] 업로드 파일 크기 제한 확인 (`src/app/api/admin/images/route.ts`)

---

## 7️⃣ 배포 플랫폼별 준비

### A. Vercel 배포 (권장)

#### 사전 준비
1. **Vercel 계정 생성**
   - https://vercel.com 에서 GitHub 연동

2. **프로젝트 연결**
   ```bash
   # Vercel CLI 설치 (선택)
   npm i -g vercel
   
   # 배포
   vercel
   ```

3. **환경 변수 설정**
   - Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
   - 위의 "1️⃣ 환경 변수 설정" 섹션의 모든 변수 추가
   - 특히 `NEXT_PUBLIC_*` 변수는 반드시 설정

4. **빌드 설정 확인**
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)
   - Install Command: `npm install` (기본값)

5. **도메인 설정**
   - Vercel 대시보드 → 프로젝트 → Settings → Domains
   - 커스텀 도메인 추가 (선택)

#### 배포 명령어
```bash
# Vercel CLI로 배포
vercel --prod

# 또는 GitHub에 푸시하면 자동 배포 (연동 시)
git push origin main
```

---

### B. Docker 배포

#### Dockerfile 생성 필요
프로젝트 루트에 `Dockerfile` 생성:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### next.config.mjs 수정 필요
```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Docker용
};
```

#### 배포 명령어
```bash
# Docker 이미지 빌드
docker build -t jangji-website .

# Docker 컨테이너 실행
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key \
  -e SESSION_SECRET=your_secret \
  -e ADMIN_USERNAME=your_username \
  -e ADMIN_PASSWORD=your_password \
  -v $(pwd)/data:/app/data \
  jangji-website
```

---

### C. VPS/서버 배포

#### PM2 사용 (권장)
```bash
# PM2 설치
npm install -g pm2

# 프로덕션 빌드
npm run build

# PM2로 실행
pm2 start npm --name "jangji-website" -- start

# PM2 설정 저장
pm2 save
pm2 startup
```

#### Nginx 리버스 프록시 설정
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 8️⃣ 최종 체크리스트

### 필수 작업

- [ ] **환경 변수 설정**
  - `.env.local` 파일 생성 및 모든 필수 변수 설정
  - 프로덕션 환경에도 동일하게 설정
  - 관련 파일: 프로젝트 루트

- [ ] **의존성 설치**
  - `npm install` 실행
  - 관련 파일: `package.json`

- [ ] **타입 체크**
  - `npx tsc --noEmit` 실행 (에러 없어야 함)
  - 관련 파일: `tsconfig.json`

- [ ] **린트 검사**
  - `npm run lint` 실행
  - 관련 파일: `.eslintrc.json` (또는 `eslint.config.js`)

- [ ] **프로덕션 빌드**
  - `npm run build` 실행 성공 확인
  - 관련 파일: `next.config.mjs`

- [ ] **로컬 프로덕션 테스트**
  - `npm start` 실행
  - http://localhost:3000 접속 테스트
  - 한국어/베트남어 페이지 모두 테스트

- [ ] **보안 설정**
  - `SESSION_SECRET` 환경 변수 설정 (강력한 값)
  - `ADMIN_USERNAME`, `ADMIN_PASSWORD` 환경 변수 설정
  - 관련 파일: `src/lib/auth.ts`

- [ ] **하드코딩 값 제거**
  - 이메일 주소 오타 수정 (`jgs7402@gamil.com` → `jgs7402@gmail.com`)
  - 관련 파일: `src/app/api/contact/route.ts:54`

- [ ] **기본 URL 설정**
  - `NEXT_PUBLIC_SITE_URL` 환경 변수 설정
  - 관련 파일: `src/app/[locale]/metadata.ts`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/sitemap.ts`, `src/app/robots.ts`

- [ ] **데이터 파일 확인**
  - `data/` 폴더의 모든 JSON 파일 존재 확인
  - 데이터 백업 수행

- [ ] **Google Maps API 키**
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 설정
  - `GOOGLE_MAPS_API_KEY` 설정 (서버 사이드)
  - 관련 파일: `src/components/common/GoogleMap.tsx`, `src/app/api/geocode/route.ts`

### 선택 작업 (권장)

- [ ] **console.log 정리**
  - 디버깅용 `console.log` 제거 또는 로깅 레벨 조정
  - 관련 파일: `src/lib/auth.ts`, `src/app/api/admin/login/route.ts`, `src/app/admin/dashboard/layout.tsx`

- [ ] **에러 핸들링 강화**
  - `console.error`는 유지하되, 프로덕션에서는 로깅 서비스 연동 고려

- [ ] **성능 최적화**
  - 이미지 최적화 확인
  - 번들 크기 확인 (`npm run build` 출력 확인)

- [ ] **SEO 설정**
  - `src/app/[locale]/metadata.ts` 확인
  - `src/app/[locale]/sitemap.ts` 확인
  - `src/app/robots.ts` 확인

### 배포 후 확인

- [ ] **프로덕션 사이트 접속 테스트**
  - 한국어 버전: `https://your-domain.com/ko`
  - 베트남어 버전: `https://your-domain.com/vi`

- [ ] **주요 기능 테스트**
  - 장지 목록 페이지
  - 장지 상세 페이지
  - 어드민 로그인
  - 장지 등록/수정
  - 문의하기 폼

- [ ] **다국어 테스트**
  - 언어 전환 버튼 작동 확인
  - 각 언어별 콘텐츠 표시 확인

- [ ] **Google Maps 테스트**
  - 지도 표시 확인
  - 지오코딩 작동 확인

---

## 9️⃣ 빠른 배포 명령어 모음

```bash
# 1. 프로젝트 디렉토리로 이동
cd "/Users/jopro/Library/Mobile Documents/com~apple~CloudDocs/tangle JP/jangji-website"

# 2. 의존성 설치
npm install

# 3. 환경 변수 파일 생성 (수동으로 내용 작성 필요)
touch .env.local

# 4. 타입 체크
npx tsc --noEmit

# 5. 린트 검사
npm run lint

# 6. 프로덕션 빌드
npm run build

# 7. 로컬 프로덕션 테스트
npm start

# 8. (Vercel 배포 시)
vercel --prod

# 또는 (GitHub 푸시 후 자동 배포)
git add .
git commit -m "배포 준비 완료"
git push origin main
```

---

## 🔟 문제 해결

### 빌드 에러 발생 시
1. `node_modules` 삭제 후 재설치
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Next.js 캐시 삭제
   ```bash
   rm -rf .next
   npm run build
   ```

### 환경 변수 관련 에러
- `.env.local` 파일이 루트에 있는지 확인
- 변수명에 오타가 없는지 확인
- `NEXT_PUBLIC_*` 변수는 클라이언트에서 접근 가능하므로 민감한 정보는 사용하지 마세요

### 다국어 관련 에러
- `messages/ko.json`, `messages/vi.json` 파일 확인
- `src/i18n/request.ts` 설정 확인

---

## ✅ 완료 체크

모든 항목을 확인한 후:
- [ ] 모든 필수 작업 완료
- [ ] 로컬 프로덕션 테스트 성공
- [ ] 배포 플랫폼 설정 완료
- [ ] 환경 변수 설정 완료
- [ ] 보안 설정 완료

**이제 배포할 준비가 되었습니다! 🚀**

