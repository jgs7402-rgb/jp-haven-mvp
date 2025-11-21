# 🚀 배포 전 터미널 명령어 모음

## 필수 명령어 (순서대로 실행)

- 프로젝트 디렉토리로 이동
  ```bash
  cd "/Users/jopro/Library/Mobile Documents/com~apple~CloudDocs/tangle JP/jangji-website"
  ```

- 의존성 설치 (한 번만 하면 됨)
  ```bash
  npm install
  ```
  > 📌 설명: 프로젝트에 필요한 모든 패키지를 설치합니다. `package.json`을 읽어서 필요한 라이브러리들을 다운로드합니다.

- TypeScript 타입 체크 (선택)
  ```bash
  npx tsc --noEmit
  ```
  > 📌 설명: 코드에 타입 에러가 있는지 확인합니다. 빌드 전에 미리 체크할 수 있습니다.

- 코드 린트 검사 (선택)
  ```bash
  npm run lint
  ```
  > 📌 설명: 코드 스타일과 잠재적 문제를 검사합니다.

- 프로덕션 빌드 (서비스용으로 묶기)
  ```bash
  npm run build
  ```
  > 📌 설명: 프로덕션 환경에서 실행할 수 있도록 코드를 최적화하고 번들링합니다. `.next` 폴더가 생성됩니다.

- 빌드된 버전 실행 (로컬 테스트)
  ```bash
  npm start
  ```
  > 📌 설명: 빌드된 프로덕션 버전을 로컬에서 실행합니다. 배포 전에 실제로 작동하는지 테스트할 수 있습니다.

## 배포 명령어 (플랫폼별)

### Vercel 배포
- Vercel CLI로 프로덕션 배포
  ```bash
  vercel --prod
  ```

### GitHub 푸시 후 자동 배포 (Vercel 연동 시)
- 변경사항 커밋 및 푸시
  ```bash
  git add .
  git commit -m "배포 준비 완료"
  git push origin main
  ```

## 문제 해결 명령어 (필요 시)

- node_modules 재설치 (빌드 에러 시)
  ```bash
  rm -rf node_modules package-lock.json && npm install
  ```

- Next.js 빌드 캐시 삭제 (빌드 에러 시)
  ```bash
  rm -rf .next && npm run build
  ```

