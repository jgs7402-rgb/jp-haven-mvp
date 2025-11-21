'use client';

import { useState, useEffect, FormEvent } from 'react';

type RegionKey = 'north' | 'central' | 'south';

type Region = {
  nameKo: string;
  nameVi: string;
  provinces: string[];
};

type RegionsData = {
  north: Region;
  central: Region;
  south: Region;
};

// 간단한 한국어-베트남어 번역 맵 (기본 지역명)
const translationMap: Record<string, string> = {
  '북부': 'Miền Bắc',
  '중부': 'Miền Trung',
  '남부': 'Miền Nam',
  '하노이': 'Hà Nội',
  '하이퐁': 'Hải Phòng',
  '다낭': 'Đà Nẵng',
  '호치민': 'Thành phố Hồ Chí Minh',
  '후에': 'Huế',
  '나트랑': 'Nha Trang',
};

// 자동 번역 함수 (API 라우트 사용)
async function translateToVietnamese(text: string): Promise<string> {
  // 먼저 맵에서 찾기
  if (translationMap[text]) {
    return translationMap[text];
  }

  // API 라우트를 통해 번역
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        source: 'ko',
        target: 'vi',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.translatedText) {
        return data.translatedText;
      }
    }
  } catch (error) {
    console.error('[TRANSLATE] Error:', error);
  }

  // 기본값: 입력된 텍스트 그대로 반환
  return text;
}

export default function RegionsAdminPage() {
  const [regions, setRegions] = useState<RegionsData>({
    north: { nameKo: '북부', nameVi: 'Miền Bắc', provinces: [] },
    central: { nameKo: '중부', nameVi: 'Miền Trung', provinces: [] },
    south: { nameKo: '남부', nameVi: 'Miền Nam', provinces: [] },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingRegion, setEditingRegion] = useState<RegionKey | null>(null);
  const [newProvince, setNewProvince] = useState('');
  const [translating, setTranslating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/regions', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to load regions');
      }
      const data = await res.json();
      setRegions(data);
    } catch (err) {
      console.error('[REGIONS] Admin fetch error:', err);
      setError('지역 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/regions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ regions }),
      });

      if (!res.ok) {
        throw new Error('Failed to save regions');
      }

      setMessage('지역 정보가 저장되었습니다.');
    } catch (err) {
      console.error('[REGIONS] Admin save error:', err);
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const addProvince = (regionKey: RegionKey) => {
    if (!newProvince.trim()) return;

    setRegions({
      ...regions,
      [regionKey]: {
        ...regions[regionKey],
        provinces: [...regions[regionKey].provinces, newProvince.trim()],
      },
    });
    setNewProvince('');
  };

  const removeProvince = (regionKey: RegionKey, index: number) => {
    setRegions({
      ...regions,
      [regionKey]: {
        ...regions[regionKey],
        provinces: regions[regionKey].provinces.filter((_, i) => i !== index),
      },
    });
  };

  const updateProvince = (regionKey: RegionKey, index: number, value: string) => {
    const newProvinces = [...regions[regionKey].provinces];
    newProvinces[index] = value;
    setRegions({
      ...regions,
      [regionKey]: {
        ...regions[regionKey],
        provinces: newProvinces,
      },
    });
  };

  // 한국어 이름 변경 시 자동 번역 제안
  const handleNameKoChange = async (regionKey: RegionKey, value: string) => {
    setRegions({
      ...regions,
      [regionKey]: {
        ...regions[regionKey],
        nameKo: value,
      },
    });

    // 자동 번역 시도 (빈 값이 아니고, 기존 값과 다를 때)
    if (value.trim() && value !== regions[regionKey].nameKo) {
      const translationKey = `${regionKey}-nameKo`;
      setTranslating({ ...translating, [translationKey]: true });
      
      try {
        const translated = await translateToVietnamese(value);
        if (translated && translated !== value) {
          setRegions({
            ...regions,
            [regionKey]: {
              ...regions[regionKey],
              nameKo: value,
              nameVi: translated, // 자동 번역 결과 적용
            },
          });
        }
      } catch (err) {
        console.error('[TRANSLATE] Error:', err);
      } finally {
        setTranslating({ ...translating, [translationKey]: false });
      }
    }
  };

  // 지역명 추가 시 자동 번역
  const handleAddProvinceWithTranslation = async (regionKey: RegionKey) => {
    if (!newProvince.trim()) return;

    const provinceKo = newProvince.trim();
    let provinceVi = provinceKo;

    // 자동 번역 시도
    try {
      const translated = await translateToVietnamese(provinceKo);
      if (translated && translated !== provinceKo) {
        provinceVi = translated;
      }
    } catch (err) {
      console.error('[TRANSLATE] Province error:', err);
    }

    // 한국어와 베트남어를 함께 저장 (형식: "한국어|베트남어" 또는 배열)
    // 현재는 단순 문자열이므로, 한국어만 저장하고 나중에 번역
    setRegions({
      ...regions,
      [regionKey]: {
        ...regions[regionKey],
        provinces: [...regions[regionKey].provinces, provinceKo],
      },
    });
    setNewProvince('');
  };

  if (isLoading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">베트남 지역 관리</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {(['north', 'central', 'south'] as RegionKey[]).map((regionKey) => (
          <div key={regionKey} className="bg-white rounded-xl shadow p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">
                {regions[regionKey].nameKo} ({regions[regionKey].nameVi})
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    한국어 이름
                    <span className="ml-2 text-xs text-gray-500">
                      (입력 시 자동 번역)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regions[regionKey].nameKo}
                      onChange={(e) => handleNameKoChange(regionKey, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="예: 북부"
                    />
                    {translating[`${regionKey}-nameKo`] && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    베트남어 이름
                    <span className="ml-2 text-xs text-gray-500">
                      (자동 번역 후 수정 가능)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={regions[regionKey].nameVi}
                    onChange={(e) =>
                      setRegions({
                        ...regions,
                        [regionKey]: {
                          ...regions[regionKey],
                          nameVi: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="예: Miền Bắc"
                  />
                </div>
              </div>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                💡 한국어 이름을 입력하면 자동으로 베트남어 번역이 제안됩니다. 번역 결과를 수정할 수 있습니다.
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지역 목록
              </label>
              <div className="space-y-2 mb-3">
                {regions[regionKey].provinces.map((province, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => updateProvince(regionKey, index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeProvince(regionKey, index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProvince}
                  onChange={(e) => setNewProvince(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddProvinceWithTranslation(regionKey);
                    }
                  }}
                  placeholder="새 지역 이름 입력 (한국어)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => handleAddProvinceWithTranslation(regionKey)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  추가
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                지역명은 한국어로 입력하세요. 베트남어는 주소 기반 자동 분류에 사용됩니다.
              </p>
            </div>
          </div>
        ))}

        {message && (
          <div className="p-4 rounded-xl bg-green-50 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
          <button
            type="button"
            onClick={loadRegions}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

