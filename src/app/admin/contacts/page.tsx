'use client';

import { useEffect, useState } from 'react';

type ContactItem = {
  id: string;
  name: string;
  phone: string;
  time?: string;
  note?: string;
  createdAt: string;
  status?: 'new' | 'done';
};

export default function ContactsAdminPage() {
  const [items, setItems] = useState<ContactItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'done'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/contacts', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to load contacts');
      }
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('[CONTACTS] Admin fetch error:', err);
      setError('상담 문의 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const updateStatus = async (id: string, status: 'new' | 'done') => {
    try {
      const res = await fetch('/api/admin/contacts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
              }
            : item
        )
      );
    } catch (err) {
      console.error('[CONTACTS] Admin update error:', err);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const filteredItems =
    filter === 'all'
      ? items
      : items.filter((item) => (filter === 'new' ? item.status !== 'done' : item.status === 'done'));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">상담 문의 관리</h1>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full border ${
              filter === 'all'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            전체 ({items.length})
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-3 py-1 rounded-full border ${
              filter === 'new'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            신규 ({items.filter((i) => i.status !== 'done').length})
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`px-3 py-1 rounded-full border ${
              filter === 'done'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            처리 완료 ({items.filter((i) => i.status === 'done').length})
          </button>
        </div>
        <button
          onClick={loadContacts}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          새로고침
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500 text-sm">불러오는 중...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500 text-sm">{error}</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          표시할 상담 문의가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-4 text-sm ${
                item.status === 'done' ? 'opacity-70' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="font-semibold text-gray-900">
                    {item.name}{' '}
                    <span className="text-xs text-gray-500 ml-1">{item.phone}</span>
                  </div>
                  {item.time && (
                    <div className="text-xs text-gray-500 mt-1">
                      희망 시간: {item.time}
                    </div>
                  )}
                  {item.note && (
                    <div className="text-xs text-gray-700 mt-2 whitespace-pre-wrap">
                      {item.note}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div>
                    {new Date(item.createdAt).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="mt-2 space-x-1">
                    {item.status !== 'done' ? (
                      <button
                        onClick={() => updateStatus(item.id, 'done')}
                        className="px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-100 hover:bg-green-100"
                      >
                        처리 완료
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(item.id, 'new')}
                        className="px-2 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      >
                        다시 처리하기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


