import { readFile } from 'fs/promises';
import { join } from 'path';
import Link from 'next/link';

async function getStats() {
  try {
    const koData = JSON.parse(
      await readFile(join(process.cwd(), 'data', 'cemeteries.ko.json'), 'utf-8')
    );
    const viData = JSON.parse(
      await readFile(join(process.cwd(), 'data', 'cemeteries.vi.json'), 'utf-8')
    );

    return {
      totalCemeteries: koData.length,
      koCemeteries: koData.length,
      viCemeteries: viData.length,
    };
  } catch {
    return {
      totalCemeteries: 0,
      koCemeteries: 0,
      viCemeteries: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">전체 장지 수</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalCemeteries}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">한국어 장지</h3>
          <p className="text-3xl font-bold text-primary">{stats.koCemeteries}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">베트남어 장지</h3>
          <p className="text-3xl font-bold text-primary">{stats.viCemeteries}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/cemeteries"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-900">장지 관리</h2>
          <p className="text-gray-600">새로운 장지를 등록하거나 기존 장지를 수정/삭제합니다.</p>
        </Link>
        <Link
          href="/admin/images"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-900">이미지 관리</h2>
          <p className="text-gray-600">홈페이지에 표시될 이미지를 업로드하고 관리합니다.</p>
        </Link>
      </div>
    </div>
  );
}


