# 🚀 Vercel 배포 준비 상태 점검 결과

## 1. Next.js 설정 파일 점검

### ✅ next.config.mjs 확인

**현재 설정**:
```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
```

**점검 결과**:
- ✅ Vercel 호환성: 문제 없음
- ✅ next-intl 플러그인: 올바르게 설정됨
- ✅ React Strict Mode: 활성화됨

**권장 추가 설정**:
```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 이미지 최적화 설정 (로컬 이미지만 사용하므로 불필요하지만 명시적으로 설정)
  images: {
    // 외부 이미지 도메인 없음 (로컬 업로드만 사용)
    remotePatterns: [],
    // 또는 외부 이미지 사용 시:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'images.unsplash.com',
    //   },
    // ],
  },
  
  // 프로덕션 빌드 최적화
  swcMinify: true,
  
  // 출력 설정 (Vercel은 자동 감지)
  // output: 'standalone', // Docker 배포 시에만 필요
};

export default withNextIntl(nextConfig);
```

**Vercel 특이사항**:
- ✅ Vercel은 Next.js를 자동으로 감지하므로 추가 설정 불필요
- ✅ 이미지 최적화는 자동으로 처리됨
- ✅ 국제화(i18n)는 next-intl로 올바르게 설정됨

---

## 2. 프로젝트 구조 점검

### ✅ App 디렉토리 구조

**현재 구조**:
```
src/app/
├── [locale]/          # 다국어 라우팅
│   ├── layout.tsx     # ✅ 올바름
│   ├── page.tsx       # ✅ 올바름
│   ├── not-found.tsx  # ✅ 올바름
│   └── ...
├── admin/             # 어드민 페이지
│   ├── layout.tsx     # ✅ 올바름
│   └── ...
├── api/               # API 라우트
│   └── ...            # ✅ 올바름
├── layout.tsx         # ✅ 루트 레이아웃
├── not-found.tsx      # ✅ 루트 404
├── page.tsx           # ✅ 루트 페이지 (리다이렉트용)
├── robots.ts          # ✅ SEO
└── globals.css        # ✅ 전역 스타일
```

**점검 결과**:
- ✅ App Router 구조 올바름
- ✅ 다국어 라우팅 (`[locale]`) 올바르게 설정됨
- ✅ API 라우트 구조 올바름
- ✅ 레이아웃 중첩 올바름

**이상한 점**: 없음 ✅

---

## 3. 에러 페이지 점검

### ✅ 404 페이지

**현재 상태**:
- ✅ `src/app/not-found.tsx` - 루트 404 페이지 존재
- ✅ `src/app/[locale]/not-found.tsx` - 다국어 404 페이지 존재

**점검 결과**: 양호 ✅

### ❌ 500 에러 페이지

**현재 상태**: 없음

**권장 조치**: 전역 에러 페이지 추가

**제안 코드**:

#### `src/app/error.tsx` (루트 에러 페이지)
```typescript
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 서비스에 전송 (선택)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-4">서버 오류가 발생했습니다</h2>
        <p className="text-gray-600 mb-8">
          일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/ko"
            className="px-6 py-3 bg-white border border-primary/20 text-primary rounded-xl hover:bg-primary/5 transition-colors"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
```

#### `src/app/[locale]/error.tsx` (다국어 에러 페이지)
```typescript
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from '@/i18n/routing';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-4">
          {t('error.title') || '서버 오류가 발생했습니다'}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('error.message') || '일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            {t('error.retry') || '다시 시도'}
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white border border-primary/20 text-primary rounded-xl hover:bg-primary/5 transition-colors"
          >
            {t('error.home') || '홈으로 가기'}
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**번역 파일에 추가** (`messages/ko.json`, `messages/vi.json`):
```json
{
  "error": {
    "title": "서버 오류가 발생했습니다",
    "message": "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
    "retry": "다시 시도",
    "home": "홈으로 가기"
  }
}
```

베트남어 (`messages/vi.json`):
```json
{
  "error": {
    "title": "Đã xảy ra lỗi máy chủ",
    "message": "Đã xảy ra sự cố tạm thời. Vui lòng thử lại sau.",
    "retry": "Thử lại",
    "home": "Về trang chủ"
  }
}
```

### ⚠️ 전역 에러 페이지 (선택)

전역 에러를 처리하려면 `src/app/global-error.tsx` 추가:

```typescript
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-background text-primary flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4">500</h1>
            <h2 className="text-2xl font-semibold mb-4">심각한 오류가 발생했습니다</h2>
            <button
              onClick={reset}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

---

## 4. Vercel 배포 체크리스트

### 필수 체크 항목

#### ✅ 프로젝트 설정
- [ ] **프로젝트 루트 확인**
  - `package.json`이 루트에 있는지 확인
  - `next.config.mjs`가 루트에 있는지 확인

- [ ] **Node.js 버전**
  - Vercel은 자동으로 감지하지만, 명시적으로 설정 가능
  - `package.json`에 `engines` 필드 추가 권장:
  ```json
  {
    "engines": {
      "node": ">=18.0.0"
    }
  }
  ```
  - Vercel 대시보드에서도 설정 가능: Settings → General → Node.js Version

#### ✅ 빌드 설정
- [ ] **Build Command**
  - 기본값: `npm run build` (자동 감지)
  - Vercel 대시보드: Settings → General → Build & Development Settings
  - 현재 설정 확인: `package.json`의 `scripts.build` 확인

- [ ] **Output Directory**
  - Next.js는 자동으로 `.next` 사용 (설정 불필요)
  - Vercel이 자동 감지

- [ ] **Install Command**
  - 기본값: `npm install` (자동 감지)
  - `package-lock.json` 존재 시 자동 사용

#### ✅ 환경 변수 설정
- [ ] **필수 환경 변수 등록**
  - Vercel 대시보드: Settings → Environment Variables
  - 다음 변수들을 Production, Preview, Development에 모두 설정:
    - `NEXT_PUBLIC_SITE_URL`
    - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
    - `GOOGLE_MAPS_API_KEY`
    - `SESSION_SECRET`
    - `ADMIN_USERNAME` (또는 `ADMIN_ID`)
    - `ADMIN_PASSWORD`

- [ ] **선택 환경 변수 등록** (기능 사용 시)
  - `GOOGLE_TRANSLATE_API_KEY`
  - `GOOGLE_SHEETS_WEBHOOK_URL`
  - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT`, `SMTP_SECURE`
  - `EMAIL_TO`, `EMAIL_FROM`, `EMAIL_API_KEY`

#### ✅ 파일 시스템
- [ ] **데이터 파일 확인**
  - `data/` 폴더의 JSON 파일들이 Git에 포함되어 있는지 확인
  - Vercel은 읽기 전용 파일 시스템이므로, 파일 쓰기는 가능하지만 재배포 시 초기화됨
  - ⚠️ **주의**: `data/` 폴더의 파일은 Git에 커밋되어야 함 (또는 외부 저장소 사용)

- [ ] **업로드 파일 처리**
  - `public/uploads/` 폴더는 Vercel의 임시 파일 시스템에 저장됨
  - ⚠️ **주의**: 재배포 시 업로드된 파일이 삭제될 수 있음
  - 권장: 외부 스토리지 (AWS S3, Cloudinary 등) 사용 고려

#### ✅ 도메인 설정
- [ ] **커스텀 도메인 연결** (선택)
  - Vercel 대시보드: Settings → Domains
  - DNS 설정 필요

#### ✅ 배포 전 최종 확인
- [ ] **로컬 빌드 테스트**
  ```bash
  npm run build
  npm start
  ```

- [ ] **환경 변수 확인**
  - 모든 필수 환경 변수가 설정되었는지 확인
  - `NEXT_PUBLIC_*` 변수는 모든 환경에 설정

- [ ] **에러 페이지 추가**
  - `src/app/error.tsx` 생성
  - `src/app/[locale]/error.tsx` 생성

---

## 5. 다른 서버 배포와의 비교

### A. Vercel 배포

**장점**:
- ✅ 자동 배포 (GitHub 푸시 시)
- ✅ 자동 HTTPS
- ✅ 자동 스케일링
- ✅ Edge Network (CDN)
- ✅ Next.js 최적화 자동 적용

**주의사항**:
- ⚠️ 파일 시스템이 임시적 (재배포 시 초기화)
- ⚠️ 서버리스 함수 제한 (실행 시간, 메모리)
- ⚠️ 업로드 파일은 외부 스토리지 필요

**필요한 설정**:
- 환경 변수만 설정하면 됨
- 추가 설정 파일 불필요

---

### B. Docker 배포

**차이점**:

1. **next.config.mjs 수정 필요**
```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Docker용 추가
};
```

2. **Dockerfile 필요**
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
COPY --from=base /app/data ./data  # 데이터 파일 복사
EXPOSE 3000
CMD ["node", "server.js"]
```

3. **환경 변수 설정**
- `.env.production` 파일 사용
- 또는 `docker-compose.yml`에서 설정

4. **데이터 파일 영구 저장**
- 볼륨 마운트 필요: `-v $(pwd)/data:/app/data`
- 재시작해도 데이터 유지

---

### C. Ubuntu/VPS + PM2 배포

**차이점**:

1. **환경 변수 설정**
- `.env.production` 파일 생성
- 또는 `ecosystem.config.js`에서 설정

2. **PM2 설정 필요**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'jangji-website',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
    },
    env_file: '.env.production',
  }]
};
```

3. **Nginx 리버스 프록시 설정**
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

4. **SSL 인증서**
- Let's Encrypt 사용: `certbot --nginx`

5. **데이터 파일 관리**
- 서버 파일 시스템에 직접 저장
- 백업 스크립트 필요

---

### 비교표

| 항목 | Vercel | Docker | Ubuntu/VPS |
|------|--------|--------|------------|
| **설정 복잡도** | ⭐ 매우 쉬움 | ⭐⭐ 보통 | ⭐⭐⭐ 어려움 |
| **자동 배포** | ✅ 자동 | ❌ 수동 | ❌ 수동 |
| **HTTPS** | ✅ 자동 | ⚠️ 수동 설정 | ⚠️ 수동 설정 |
| **파일 저장** | ⚠️ 임시적 | ✅ 영구적 | ✅ 영구적 |
| **비용** | 무료 플랜 있음 | 서버 비용 | 서버 비용 |
| **스케일링** | ✅ 자동 | ⚠️ 수동 | ⚠️ 수동 |
| **데이터 백업** | ⚠️ 수동 필요 | ✅ 볼륨 사용 | ✅ 파일 시스템 |

---

## 6. Vercel 배포 시 특별 주의사항

### ⚠️ 파일 시스템 제한

**문제점**:
- Vercel은 서버리스 환경이므로 파일 시스템이 임시적
- `data/` 폴더의 JSON 파일은 Git에 커밋되어야 함
- `public/uploads/` 폴더는 재배포 시 초기화됨

**해결 방법**:

1. **데이터 파일 Git 커밋** (현재 방식)
   ```bash
   # data/ 폴더를 Git에 포함
   git add data/
   git commit -m "Add data files"
   ```

2. **외부 스토리지 사용** (권장)
   - 업로드 파일: AWS S3, Cloudinary, Vercel Blob
   - 데이터 파일: 데이터베이스 (MongoDB, PostgreSQL 등)

### ⚠️ API 라우트 제한

**제한사항**:
- 실행 시간: 10초 (Hobby), 60초 (Pro)
- 메모리: 1024MB
- 파일 크기: 4.5MB (요청/응답)

**현재 프로젝트 영향**:
- ✅ 이미지 업로드 (5MB 제한) - Vercel 제한 내
- ✅ API 응답 크기 - 문제 없음

---

## 7. 최종 체크리스트

### 배포 전 필수 확인

- [ ] **로컬 빌드 성공**
  ```bash
  npm run build
  npm start
  ```

- [ ] **에러 페이지 추가**
  - `src/app/error.tsx` 생성
  - `src/app/[locale]/error.tsx` 생성

- [ ] **환경 변수 준비**
  - 모든 필수 환경 변수 목록 작성
  - Vercel 대시보드에 등록 준비

- [ ] **데이터 파일 확인**
  - `data/` 폴더의 모든 JSON 파일이 Git에 포함되어 있는지 확인

- [ ] **Git 커밋**
  ```bash
  git add .
  git commit -m "배포 준비 완료"
  git push origin main
  ```

### Vercel 배포 시

- [ ] **프로젝트 연결**
  - GitHub 저장소 연결 또는 직접 업로드

- [ ] **환경 변수 설정**
  - Settings → Environment Variables
  - 모든 필수 변수 추가

- [ ] **빌드 설정 확인**
  - Build Command: `npm run build` (자동 감지)
  - Output Directory: 자동 감지
  - Node.js Version: 18 이상

- [ ] **첫 배포 실행**
  - Deploy 버튼 클릭
  - 빌드 로그 확인

- [ ] **배포 후 테스트**
  - 홈페이지 접속 테스트
  - 한국어/베트남어 페이지 테스트
  - 어드민 로그인 테스트
  - API 동작 테스트

---

## 8. 문제 해결 가이드

### 빌드 실패 시

1. **로컬에서 빌드 테스트**
   ```bash
   npm run build
   ```

2. **에러 로그 확인**
   - Vercel 대시보드 → Deployments → 실패한 배포 → Build Logs

3. **일반적인 원인**
   - 환경 변수 누락
   - TypeScript 에러
   - 의존성 문제

### 런타임 에러 시

1. **함수 로그 확인**
   - Vercel 대시보드 → Functions → 로그 확인

2. **환경 변수 확인**
   - 모든 `NEXT_PUBLIC_*` 변수가 설정되었는지 확인

3. **에러 페이지 확인**
   - `error.tsx` 파일이 올바르게 작동하는지 확인

---

**배포 준비 완료! 🚀**

