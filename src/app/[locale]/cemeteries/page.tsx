'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Section from '@/components/common/Section';
import Card from '@/components/common/Card';
import cemeteriesKo from '../../../../data/cemeteries.ko.json';
import cemeteriesVi from '../../../../data/cemeteries.vi.json';

type Cemetery = {
  id: string;
  name?: string;
  type?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  phone?: string;
  hours?: string;
  cremation?: boolean;
  burial?: boolean;
  columbarium?: boolean;
  religious?: boolean;
  budget_min?: number;
  budget_max?: number;
  lat?: number;
  lng?: number;
  image?: string;
  description?: string;
  region?: string;
};

type RegionsData = {
  north: {
    nameKo: string;
    nameVi: string;
    provinces: string[];
  };
  central: {
    nameKo: string;
    nameVi: string;
    provinces: string[];
  };
  south: {
    nameKo: string;
    nameVi: string;
    provinces: string[];
  };
};

// 어드민에서 등록된 장지인지 확인 (필수 필드 체크)
function isRegisteredCemetery(cemetery: any, locale: string): boolean {
  // ID가 필수 (어드민에서 등록된 항목은 반드시 ID가 있어야 함)
  if (!cemetery.id) {
    return false;
  }
  
  // 이름이 필수 (비어있거나 공백만 있으면 안됨)
  if (!cemetery.name || typeof cemetery.name !== 'string' || cemetery.name.trim() === '') {
    return false;
  }
  
  // 설명이 필수 (비어있거나 공백만 있으면 안됨)
  if (!cemetery.description || typeof cemetery.description !== 'string' || cemetery.description.trim() === '') {
    return false;
  }
  
  // 베트남어 버전에서는 한국어 이름/설명이 있는 항목 필터링
  if (locale === 'vi') {
    // 한국어 문자(한글)가 포함되어 있으면 필터링
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    if (koreanRegex.test(cemetery.name) || koreanRegex.test(cemetery.description)) {
      return false;
    }
  }
  
  // 더미 전화번호 필터링 (+82-XX-000-0000 패턴)
  if (cemetery.phone) {
    const dummyPhonePattern = /\+82-\d{2}-000-0000/;
    if (dummyPhonePattern.test(cemetery.phone)) {
      return false;
    }
  }
  
  // 주소 정보 중 하나는 있어야 함 (address 또는 province/city/district)
  const hasAddress = cemetery.address && 
                     typeof cemetery.address === 'string' && 
                     cemetery.address.trim() !== '';
  const hasProvince = cemetery.province && 
                      typeof cemetery.province === 'string' && 
                      cemetery.province.trim() !== '';
  const hasCity = cemetery.city && 
                  typeof cemetery.city === 'string' && 
                  cemetery.city.trim() !== '';
  const hasDistrict = cemetery.district && 
                      typeof cemetery.district === 'string' && 
                      cemetery.district.trim() !== '';
  const hasLocation = hasProvince || hasCity || hasDistrict;
  
  if (!hasAddress && !hasLocation) {
    return false;
  }
  
  return true;
}

const typeMap: Record<string, string> = {
  ko: {
    '공원묘원': 'cemetery',
    '수목장': 'tree',
    '납골당': 'columbarium',
    '화장장': 'crematory',
  },
  vi: {
    'Công viên nghĩa trang': 'cemetery',
    'Nghĩa trang sinh thái': 'tree',
    'Nhà lưu tro': 'columbarium',
    'Hỏa táng': 'crematory',
  },
} as any;

export default function CemeteriesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regions, setRegions] = useState<RegionsData | null>(null);

  // 지역 데이터 로드
  useEffect(() => {
    fetch('/api/regions')
      .then((res) => res.json())
      .then((data) => setRegions(data))
      .catch((err) => console.error('[REGIONS] Fetch error:', err));
  }, []);

  const rawCemeteries: any[] =
    locale === 'ko' ? cemeteriesKo : cemeteriesVi;

  // 어드민에서 등록된 장지만 필터링
  const cemeteries: Cemetery[] = useMemo(() => {
    return rawCemeteries
      .filter((c) => isRegisteredCemetery(c, locale))
      .map((c, index) => ({
        id: c.id ?? String(index + 1),
        ...c,
      }));
  }, [rawCemeteries, locale]);

  const filtered = useMemo(() => {
    return cemeteries.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.district && c.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = !selectedType || c.type === selectedType;
      
      const matchesRegion = !selectedRegion || c.region === selectedRegion;

      return matchesSearch && matchesType && matchesRegion;
    });
  }, [cemeteries, searchQuery, selectedType, selectedRegion]);

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(cemeteries.map((c) => c.type)));
    return types;
  }, [cemeteries]);

  // 지역별로 그룹화
  const groupedByRegion = useMemo(() => {
    if (!regions) return {};
    
    const grouped: Record<string, Record<string, Cemetery[]>> = {};
    
    filtered.forEach((cemetery) => {
      const region = cemetery.region || 'other';
      const province = cemetery.province || '기타';
      
      if (!grouped[region]) {
        grouped[region] = {};
      }
      if (!grouped[region][province]) {
        grouped[region][province] = [];
      }
      grouped[region][province].push(cemetery);
    });
    
    return grouped;
  }, [filtered, regions]);

  // 지역 순서 정의
  const regionOrder = ['north', 'central', 'south'];

  return (
    <Section>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            {t('search.title')}
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.q')}
            className="px-3 py-2 rounded-xl bg-white border border-primary/20 w-56 focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label={t('search.q')}
          />
          {regions && (
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={locale === 'ko' ? '지역' : 'Khu vực'}
            >
              <option value="">{locale === 'ko' ? '전체 지역' : 'Tất cả khu vực'}</option>
              {regionOrder.map((regionKey) => {
                const regionData = regions[regionKey as keyof RegionsData];
                const regionName = locale === 'ko' ? regionData.nameKo : regionData.nameVi;
                return (
                  <option key={regionKey} value={regionKey}>
                    {regionName}
                  </option>
                );
              })}
            </select>
          )}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label={t('search.type')}
          >
            <option value="">{t('search.all')}</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 opacity-60">
          {locale === 'ko' ? '검색 결과가 없습니다.' : 'Không tìm thấy kết quả.'}
        </div>
      ) : regions ? (
        <div className="space-y-12">
          {regionOrder.map((regionKey) => {
            const regionData = regions[regionKey as keyof RegionsData];
            const regionName = locale === 'ko' ? regionData.nameKo : regionData.nameVi;
            const provinceGroups = groupedByRegion[regionKey];
            
            if (!provinceGroups || Object.keys(provinceGroups).length === 0) {
              return null;
            }
            
            return (
              <div key={regionKey} className="space-y-6">
                {/* 대분류: 지역 */}
                <div className="border-b-2 border-primary/20 pb-2">
                  <h2 className="text-xl md:text-2xl font-semibold">{regionName}</h2>
                </div>
                
                {/* 소분류: 도시/지역별 */}
                {Object.entries(provinceGroups).map(([province, cemeteries]) => (
                  <div key={province} className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700">{province}</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cemeteries.map((cemetery) => (
                        <Card key={cemetery.id} className="overflow-hidden">
                          <div
                            className="h-40 bg-primary/5"
                            style={{
                              backgroundImage: `url(${cemetery.image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-lg">{cemetery.name}</h3>
                            <p className="text-sm mt-1 opacity-80">{cemetery.description}</p>
                            <div className="mt-3 flex items-center justify-between text-sm">
                              <span className="opacity-80">
                                {(cemetery.city || cemetery.province || '')} {cemetery.type ? `· ${cemetery.type}` : ''}
                              </span>
                              {cemetery.phone && (
                                <a
                                  href={`tel:${cemetery.phone.replace(/-/g, '').replace(/\+/g, '')}`}
                                  className="underline hover:no-underline"
                                  aria-label={t('cards.phone')}
                                >
                                  {cemetery.phone}
                                </a>
                              )}
                            </div>
                            {cemetery.hours && (
                              <div className="mt-2 text-xs opacity-60">
                                {t('cards.hours')}: {cemetery.hours}
                              </div>
                            )}
                            <div className="mt-4">
                              <Link
                                href={`/${locale}/cemeteries/${cemetery.id}`}
                                className="inline-block px-3 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
                              >
                                {t('cards.more')}
                              </Link>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cemetery) => (
            <Card key={cemetery.id} className="overflow-hidden">
              <div
                className="h-40 bg-primary/5"
                style={{
                  backgroundImage: `url(${cemetery.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{cemetery.name}</h3>
                <p className="text-sm mt-1 opacity-80">{cemetery.description}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="opacity-80">
                    {(cemetery.city || cemetery.province || '')} {cemetery.type ? `· ${cemetery.type}` : ''}
                  </span>
                  {cemetery.phone && (
                    <a
                      href={`tel:${cemetery.phone.replace(/-/g, '').replace(/\+/g, '')}`}
                      className="underline hover:no-underline"
                      aria-label={t('cards.phone')}
                    >
                      {cemetery.phone}
                    </a>
                  )}
                </div>
                {cemetery.hours && (
                  <div className="mt-2 text-xs opacity-60">
                    {t('cards.hours')}: {cemetery.hours}
                  </div>
                )}
                <div className="mt-4">
                  <Link
                    href={`/${locale}/cemeteries/${cemetery.id}`}
                    className="inline-block px-3 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
                  >
                    {t('cards.more')}
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}

