# 어드민 사이트 접속 정보

## 프로덕션 (상용) 사이트

프로젝트가 Vercel에 배포되어 있다면, 어드민 사이트 주소는 다음과 같습니다:

### 일반적인 Vercel URL 형식

**어드민 로그인 페이지:**
```
https://[프로젝트명].vercel.app/admin/login
```

또는 커스텀 도메인이 설정되어 있다면:
```
https://[도메인]/admin/login
```

### 프로젝트명 확인 방법

1. **Vercel 대시보드에서 확인**
   - https://vercel.com/dashboard 접속
   - 로그인 후 프로젝트 목록에서 확인
   - 프로젝트명이 보통 GitHub 저장소명과 동일합니다
   - 현재 저장소명: `jp-haven-mvp`

2. **예상되는 URL (프로젝트명 기준)**
   ```
   https://jp-haven-mvp.vercel.app/admin/login
   ```

3. **환경 변수에서 확인**
   - Vercel 대시보드 > 프로젝트 설정 > Environment Variables
   - `NEXT_PUBLIC_SITE_URL` 변수 값 확인
   - 예: `https://jp-haven-mvp.vercel.app`

## 로그인 정보

- **아이디**: `admin`
- **비밀번호**: `cho-342020`

## 어드민 메뉴

로그인 후 접근 가능한 페이지:

- **대시보드**: `/admin/dashboard`
- **장지 관리**: `/admin/cemeteries`
- **이미지 관리**: `/admin/images`
- **지역 관리**: `/admin/regions`
- **핫라인 관리**: `/admin/hotline`
- **장례 절차 관리**: `/admin/process`
- **상담 문의 관리**: `/admin/contacts`
- **비밀번호 변경**: `/admin/password`

## 정확한 URL 확인 방법

Vercel 대시보드에서:
1. 프로젝트 선택
2. "Domains" 탭에서 확인
3. 또는 "Deployments" 탭에서 최신 배포의 URL 확인

