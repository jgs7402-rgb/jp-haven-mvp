'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CemeteryDetailModal from '@/components/admin/CemeteryDetailModal';

type Cemetery = {
  id: string;
  name: string;
  type?: string;
  types?: string[];
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  hours: string;
  image?: string;
  mainImage?: string;
  images?: string[];
  description: string;
};

export default function CemeteriesPage() {
  const [cemeteries, setCemeteries] = useState<Cemetery[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<'ko' | 'vi'>('ko');
  const [selectedCemetery, setSelectedCemetery] = useState<Cemetery | null>(null);

  useEffect(() => {
    fetchCemeteries();
  }, [locale]);

  const fetchCemeteries = async () => {
    try {
      const response = await fetch(`/api/admin/cemeteries?locale=${locale}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setCemeteries(data);
      }
    } catch (error) {
      console.error('Failed to fetch cemeteries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/cemeteries/${id}?locale=${locale}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchCemeteries();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">장지 관리</h1>
        <div className="flex gap-4">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'ko' | 'vi')}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ko">한국어</option>
            <option value="vi">베트남어</option>
          </select>
          <Link
            href="/admin/cemeteries/new"
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            + 새 장지 추가
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                유형
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주소
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                운영시간
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cemeteries.map((cemetery) => (
              <tr key={cemetery.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{cemetery.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {cemetery.types?.join(', ') || cemetery.type || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {cemetery.address || 
                      [cemetery.province, cemetery.city, cemetery.district]
                        .filter(Boolean)
                        .join(' ') || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{cemetery.hours || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedCemetery(cemetery)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    상세보기
                  </button>
                  <Link
                    href={`/admin/cemeteries/${cemetery.id}?locale=${locale}`}
                    className="text-primary hover:text-primary/80 mr-4"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(cemetery.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cemeteries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            등록된 장지가 없습니다.
          </div>
        )}
      </div>

      {selectedCemetery && (
        <CemeteryDetailModal
          cemetery={selectedCemetery}
          onClose={() => setSelectedCemetery(null)}
        />
      )}
    </div>
  );
}


