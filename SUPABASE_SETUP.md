# Supabase 설정 가이드

## 1. Supabase 테이블 생성

Supabase Dashboard에서 다음 SQL을 실행하여 `process_steps` 테이블을 생성하세요:

```sql
-- process_steps 테이블 생성
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  locale VARCHAR(2) NOT NULL CHECK (locale IN ('ko', 'vi')),
  step_order INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_process_steps_locale_order 
  ON process_steps(locale, step_order);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Public read access" ON process_steps
  FOR SELECT
  USING (true);

-- 관리자 쓰기 정책 (서비스 역할만 쓰기 가능)
-- 참고: 실제 사용 시에는 인증된 관리자만 쓰기할 수 있도록 더 엄격한 정책을 설정하세요.
CREATE POLICY "Service role write access" ON process_steps
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## 2. 환경 변수 설정

프로젝트 루트의 `.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase 프로젝트 정보 확인 방법

1. Supabase Dashboard (https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. Settings → API 메뉴 이동
4. 다음 정보 확인:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 사용
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용

## 3. 테이블 스키마

### `process_steps` 테이블

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 자동 생성되는 고유 ID |
| `locale` | VARCHAR(2) | NOT NULL, CHECK | 언어 코드 ('ko' 또는 'vi') |
| `step_order` | INTEGER | NOT NULL | 절차 순서 (1부터 시작) |
| `text` | TEXT | NOT NULL | 절차 내용 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성 시간 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정 시간 |

### 인덱스

- `idx_process_steps_locale_order`: `(locale, step_order)` 복합 인덱스
  - 특정 locale의 절차를 순서대로 빠르게 조회하기 위함

## 4. 데이터 마이그레이션

기존 JSON 파일(`data/process.ko.json`, `data/process.vi.json`)의 데이터를 Supabase로 마이그레이션하려면:

### 마이그레이션 스크립트 (선택 사항)

Supabase Dashboard의 SQL Editor에서 실행:

```sql
-- 한국어 절차 데이터 삽입 예시
INSERT INTO process_steps (locale, step_order, text) VALUES
  ('ko', 1, '문의 접수'),
  ('ko', 2, '상담 및 예산 가이드'),
  ('ko', 3, '장지 후보 제안/예약'),
  ('ko', 4, '의전/운구/화장 연계'),
  ('ko', 5, '봉안/안치 진행'),
  ('ko', 6, '사후 안내 및 관리')
ON CONFLICT DO NOTHING;

-- 베트남어 절차 데이터 삽입 예시
INSERT INTO process_steps (locale, step_order, text) VALUES
  ('vi', 1, 'Tiếp nhận yêu cầu'),
  ('vi', 2, 'Tư vấn & ngân sách'),
  ('vi', 3, 'Đề xuất/đặt chỗ nơi an táng'),
  ('vi', 4, 'Phối hợp nghi lễ/di quan/hỏa táng'),
  ('vi', 5, 'An vị/đặt tro cốt'),
  ('vi', 6, 'Hướng dẫn & chăm sóc hậu sự')
ON CONFLICT DO NOTHING;
```

## 5. Vercel 배포 시 환경 변수 설정

Vercel Dashboard에서 환경 변수를 설정하세요:

1. Vercel Dashboard 접속
2. 프로젝트 선택
3. Settings → Environment Variables 메뉴 이동
4. 다음 환경 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key

## 6. 테스트

### 로컬 테스트

```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 개발 서버 실행
npm run dev
```

### API 테스트

1. 관리자 API 테스트:
   ```bash
   # GET (인증 필요)
   curl http://localhost:3000/api/admin/process?locale=ko
   
   # PUT (인증 필요)
   curl -X PUT http://localhost:3000/api/admin/process \
     -H "Content-Type: application/json" \
     -d '{"locale":"ko","steps":["문의 접수","상담 및 예산 가이드"]}'
   ```

2. 공개 API 테스트:
   ```bash
   # GET (인증 불필요)
   curl http://localhost:3000/api/process?locale=ko
   ```

## 7. 주의사항

1. **RLS 정책**: 프로덕션 환경에서는 더 엄격한 RLS 정책을 설정하세요.
2. **서비스 역할 키**: 현재는 anon key를 사용하지만, 서버 사이드에서만 사용하는 경우 service role key 사용을 고려하세요.
3. **데이터 백업**: 정기적으로 Supabase 데이터를 백업하세요.

