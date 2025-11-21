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
      setLoading(true);
      const response = await fetch(`/api/admin/cemeteries?locale=${locale}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      
      const data = await response.json();
      setCemeteries(data || []);
    } catch (error) {
      console.error('Failed to fetch cemeteries:', error);
      alert('장지 목록을 불러오는 중 오류가 발생했습니다.');
      setCemeteries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
      const response = await fetch(`/api/admin/cemeteries/${id}?locale=${locale}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('장지가 성공적으로 삭제되었습니다.');
          fetchCemeteries();
        } else {
          alert(data.error || '삭제에 실패했습니다.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || `삭제에 실패했습니다. (상태 코드: ${response.status})`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">장지 관리</h1>
          <p className="text-gray-600 text-sm">등록된 장지를 관리하고 수정할 수 있습니다.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'ko' | 'vi')}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-sm font-medium transition-all"
          >
            <option value="ko">🇰🇷 한국어</option>
            <option value="vi">🇻🇳 베트남어</option>
          </select>
          <Link
            href="/admin/cemeteries/new"
            className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 장지 추가
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {cemeteries.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">등록된 장지가 없습니다</h3>
            <p className="text-gray-600 text-sm mb-6">새로운 장지를 등록해보세요.</p>
            <Link
              href="/admin/cemeteries/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              첫 장지 등록하기
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    유형
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    주소
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    운영시간
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {cemeteries.map((cemetery) => (
                  <tr key={cemetery.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{cemetery.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {(cemetery.types || (cemetery.type ? [cemetery.type] : [])).map((type, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {cemetery.address || 
                          [cemetery.province, cemetery.city, cemetery.district]
                            .filter(Boolean)
                            .join(' ') || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{cemetery.hours || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCemetery(cemetery)}
                          className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          상세
                        </button>
                        <Link
                          href={`/admin/cemeteries/${cemetery.id}?locale=${locale}`}
                          className="px-3 py-1.5 text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => handleDelete(cemetery.id)}
                          className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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


