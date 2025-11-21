// 하위 레이아웃: 상위 admin/layout.tsx에서 이미 AdminNav와 세션 검증을 처리하므로
// 여기서는 단순히 children만 렌더링합니다.
export default function CemeteriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-6">{children}</div>;
}


