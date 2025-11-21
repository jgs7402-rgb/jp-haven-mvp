'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { href: '/admin/dashboard', label: '대시보드' },
    { href: '/admin/cemeteries', label: '장지 관리' },
    { href: '/admin/images', label: '이미지 관리' },
    { href: '/admin/regions', label: '지역 관리' },
    { href: '/admin/hotline', label: '핫라인 관리' },
    { href: '/admin/process', label: '장례 절차 관리' },
    { href: '/admin/contacts', label: '상담 문의 관리' },
    { href: '/admin/password', label: '비밀번호 변경' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin/dashboard" className="text-xl font-bold text-primary">
                JP Haven 관리자
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <Link
              href="/ko"
              target="_blank"
              className="text-sm text-gray-500 hover:text-gray-700 mr-4"
            >
              사이트 보기
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}


