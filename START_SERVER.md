# 서버 시작 가이드

## 문제 해결 완료

1. ✅ `.next` 폴더 삭제 및 재빌드 완료
2. ✅ Error 페이지 수정 완료 (useTranslations 제거)
3. ✅ Not-found 페이지 CSS 수정 완료
4. ✅ 빌드 성공 확인

## 서버 시작 방법

```bash
# 1. 프로젝트 디렉토리로 이동
cd "/Users/jopro/Library/Mobile Documents/com~apple~CloudDocs/tangle JP/jangji-website"

# 2. 개발 서버 시작
npm run dev
```

## 로그인 정보

- **아이디**: `admin`
- **비밀번호**: `cho-342020`

## 접속 주소

- **로컬**: http://localhost:3000
- **어드민 로그인**: http://localhost:3000/admin/login
- **어드민 대시보드**: http://localhost:3000/admin/dashboard

## 문제가 계속되면

1. 터미널에서 `Ctrl+C`로 서버 중지
2. `.next` 폴더 삭제: `rm -rf .next`
3. 다시 시작: `npm run dev`

