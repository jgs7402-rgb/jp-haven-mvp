// 로그인 페이지는 별도 레이아웃 (세션 검증 없음)
// 이 layout은 /admin/layout.tsx보다 우선순위가 높아서
// /admin/layout.tsx의 세션 검증을 건너뛸 수 없습니다.
// 따라서 이 layout에서는 세션 검증을 건너뛰고 바로 렌더링합니다.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 로그인 페이지는 레이아웃 없이 렌더링 (세션 검증 없음)
  return <>{children}</>;
}
