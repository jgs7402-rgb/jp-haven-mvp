# JP Haven - 장서·장지 안내 웹사이트

한국어/베트남어 다국어 지원 장서·장지(납골당/수목장/공원묘원) 안내 웹사이트입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **Deployment**: Vercel (권장)

## 주요 기능

- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)
- ✅ 한국어/베트남어 다국어 지원 (URL 기반: `/ko`, `/vi`)
- ✅ 장지 디렉터리 (검색/필터 기능)
- ✅ 장례 절차 안내
- ✅ 상담문의 폼 (서버 액션)
- ✅ 전화상담 CTA (헤더, 히어로, 푸터)
- ✅ SEO 최적화 (메타태그, OG, JSON-LD, sitemap.xml, robots.txt)
- ✅ 접근성 (a11y) 준수
- ✅ **어드민 사이트** (장지 관리, 이미지 업로드)
- ✅ **Google Maps 연동** (장지 위치 표시)

## 시작하기

### 1. 의존성 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 사이트 URL (프로덕션 도메인)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# 어드민 아이디 (기본값: admin)
ADMIN_ID=admin

# 어드민 비밀번호 (기본값: admin123)
ADMIN_PASSWORD=your-secure-password

# 세션 시크릿 (프로덕션에서는 반드시 변경)
SESSION_SECRET=your-random-secret-key

# Google Sheets Webhook (선택사항)
# Google Apps Script Webhook URL
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# 이메일 전송 (선택사항)
# 이메일 서비스 API 키
EMAIL_API_KEY=your_email_api_key
EMAIL_TO=contact@your-domain.com

# Google Maps API (필수 - 지도 표시용)
# Google Cloud Console에서 발급받은 API 키
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 빌드

```bash
npm run build
# 또는
yarn build
# 또는
pnpm build
```

### 5. 프로덕션 실행

```bash
npm start
# 또는
yarn start
# 또는
pnpm start
```

## Google Maps API 설정

### 1. API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services > Library**로 이동
4. 다음 API들을 활성화:
   - **Maps JavaScript API** (지도 표시용)
   - **Geocoding API** (주소를 좌표로 변환)
5. **APIs & Services > Credentials**로 이동
6. **Create Credentials > API Key** 클릭
7. 생성된 API 키를 복사

### 2. API 키 제한 설정 (권장)

보안을 위해 API 키에 제한을 설정하는 것을 권장합니다:

1. 생성한 API 키 클릭
2. **Application restrictions**:
   - **HTTP referrers (web sites)** 선택
   - 웹사이트 도메인 추가 (예: `https://your-domain.com/*`)
3. **API restrictions**:
   - **Restrict key** 선택
   - **Maps JavaScript API**와 **Geocoding API**만 선택
4. 저장

### 3. 환경 변수 설정

`.env.local` 파일에 다음을 추가:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**참고**: 
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: 클라이언트 사이드에서 지도 표시용
- `GOOGLE_MAPS_API_KEY`: 서버 사이드에서 Geocoding API 호출용

## Google Sheets Webhook 연동 가이드

### 1. Google Apps Script 생성

1. [Google Apps Script](https://script.google.com/)에 접속
2. 새 프로젝트 생성
3. 다음 코드를 입력:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.name,
      data.phone,
      data.time,
      data.note
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. 배포 > 새 배포 > 유형: 웹 앱
5. 실행 사용자: 나
6. 액세스 권한: 모든 사용자
7. 배포 후 웹 앱 URL을 복사하여 `GOOGLE_SHEETS_WEBHOOK_URL`에 설정

### 2. Google Sheet 준비

1. 새 Google Sheet 생성
2. 첫 번째 행에 헤더 추가: `날짜`, `이름`, `연락처`, `희망시간`, `메모`
3. Apps Script에서 이 Sheet를 활성화

## 프로젝트 구조

```
jangji-website/
├── src/
│   ├── app/
│   │   ├── [locale]/          # 언어별 페이지
│   │   │   ├── page.tsx       # 홈
│   │   │   ├── cemeteries/    # 장지 디렉터리
│   │   │   ├── process/       # 장례 절차
│   │   │   ├── contact/       # 문의
│   │   │   └── layout.tsx      # 레이아웃
│   │   ├── api/
│   │   │   └── contact/       # 문의 폼 API
│   │   ├── globals.css        # 전역 스타일
│   │   └── layout.tsx         # 루트 레이아웃
│   ├── components/
│   │   └── common/            # 공통 컴포넌트
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── LanguageSwitcher.tsx
│   │       ├── PhoneCTA.tsx
│   │       ├── Section.tsx
│   │       └── Card.tsx
│   ├── i18n/                  # i18n 설정
│   │   ├── request.ts
│   │   └── routing.ts
│   └── middleware.ts          # 미들웨어
├── data/                      # 데이터 파일
│   ├── cemeteries.ko.json
│   └── cemeteries.vi.json
├── messages/                  # 번역 파일
│   ├── ko.json
│   └── vi.json
└── public/                    # 정적 파일
```

## 배포 (Vercel)

### 1. Vercel에 배포

1. [Vercel](https://vercel.com)에 로그인
2. 새 프로젝트 생성
3. GitHub 저장소 연결 또는 직접 업로드
4. 환경 변수 설정 (Vercel 대시보드에서)
5. 배포 완료!

### 2. 환경 변수 설정 (Vercel)

Vercel 대시보드 > 프로젝트 설정 > Environment Variables에서 다음 변수들을 추가:

- `NEXT_PUBLIC_SITE_URL`: 프로덕션 도메인
- `ADMIN_ID`: 어드민 아이디 (기본값: admin)
- `ADMIN_PASSWORD`: 어드민 비밀번호
- `SESSION_SECRET`: 세션 시크릿 키
- `GOOGLE_SHEETS_WEBHOOK_URL`: (선택사항)
- `EMAIL_API_KEY`: (선택사항)
- `EMAIL_TO`: (선택사항)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API 키 (필수)
- `GOOGLE_MAPS_API_KEY`: Google Maps API 키 (서버 사이드 Geocoding용, 필수)

## 어드민 사이트

### 접속 방법

1. 브라우저에서 `/admin/login`으로 이동
2. 환경 변수 `ADMIN_ID`와 `ADMIN_PASSWORD`로 설정한 아이디와 비밀번호 입력 (기본값: `admin` / `admin123`)
3. 로그인 후 대시보드에서 다음 기능 사용 가능:
   - **장지 관리**: 새로운 장지 추가, 수정, 삭제
   - **이미지 관리**: 홈페이지 히어로 이미지 업로드 및 관리

### 어드민 기능

- **장지 관리** (`/admin/cemeteries`)
  - 한국어/베트남어 장지 정보 추가/수정/삭제
  - 장지 상세 정보 입력 (이름, 유형, 지역, 전화번호, 좌표 등)
  
- **이미지 관리** (`/admin/images`)
  - 홈페이지 히어로 이미지 업로드
  - 장지 이미지 업로드
  - 업로드된 이미지 삭제

### 보안

- 어드민 페이지는 세션 기반 인증 사용
- 환경 변수로 비밀번호 설정 (프로덕션에서는 반드시 강력한 비밀번호 사용)
- 세션 유효기간: 24시간

## 커스터마이징

### 색상 변경

`tailwind.config.ts`에서 색상을 변경할 수 있습니다:

```typescript
colors: {
  background: "#F2EEE8",  // 배경색
  primary: "#0F3D34",     // 포인트 색상
}
```

### 전화번호 변경

각 컴포넌트에서 `PHONE_NUMBER` 상수를 수정하세요:
- `src/components/common/Header.tsx`
- `src/components/common/Footer.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/contact/page.tsx`

### 데이터 추가

어드민 사이트를 통해 추가하거나, 직접 `data/cemeteries.ko.json`과 `data/cemeteries.vi.json`에 장지 정보를 추가할 수 있습니다.

## 접근성

- ARIA 레이블 사용
- 키보드 네비게이션 지원
- 포커스 스타일 제공
- 색상 대비 준수 (WCAG AA)

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

# JP-Haeven---MVP
