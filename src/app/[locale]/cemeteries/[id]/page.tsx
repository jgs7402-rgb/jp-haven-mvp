'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Section from '@/components/common/Section';
import GoogleMapComponent from '@/components/common/GoogleMap';
import cemeteriesKo from '../../../../../data/cemeteries.ko.json';
import cemeteriesVi from '../../../../../data/cemeteries.vi.json';

// 기본 좌표 (서울)
const DEFAULT_CENTER = {
  lat: 37.5665,
  lng: 126.9780,
};

type Cemetery = {
  id: string;
  name: string;
  type?: string;
  types?: string[];
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  phone?: string;
  hours: string;
  image?: string;
  mainImage?: string;
  images?: string[];
  description: string;
  lat?: number;
  lng?: number;
};

export default function CemeteryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const locale = params.locale as string;
  const id = params.id as string;

  const [cemetery, setCemetery] = useState<Cemetery | null>(null);
  const [mapLat, setMapLat] = useState<number | undefined>(undefined);
  const [mapLng, setMapLng] = useState<number | undefined>(undefined);
  const [hasMapApiKey, setHasMapApiKey] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    time: '',
    note: '',
    honeypot: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [contactError, setContactError] = useState('');

  // 어드민에서 등록된 장지인지 확인 (필수 필드 체크)
  const isRegisteredCemetery = (cemetery: any, currentLocale: string): boolean => {
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
    if (currentLocale === 'vi') {
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
  };

  useEffect(() => {
    const rawList = locale === 'ko' ? cemeteriesKo : cemeteriesVi;
    
    // 어드민에서 등록된 장지만 필터링
    const registeredCemeteries = rawList
      .filter((c) => isRegisteredCemetery(c, locale))
      .map((c, index) => ({
        id: c.id ?? String(index + 1),
        ...c,
      }));
    
    const found = registeredCemeteries.find((c) => c.id === id);
    setCemetery(found || null);

    // API 키 확인 (클라이언트 사이드에서만)
    if (typeof window !== 'undefined') {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      const isValid = !!apiKey && 
        apiKey !== 'your_google_maps_api_key_here' && 
        apiKey !== '여기에_실제_API_키_입력' &&
        !apiKey.includes('여기에_실제') &&
        !apiKey.includes('your_google') &&
        apiKey.trim() !== '' &&
        apiKey.length >= 20;
      setHasMapApiKey(isValid);
      console.log('[MAP] API Key check:', { hasKey: !!apiKey, isValid, keyLength: apiKey.length });
    }
  }, [id, locale]);

  // 주소를 좌표로 변환
  useEffect(() => {
    if (!cemetery) {
      // 기본 좌표 설정
      setMapLat(DEFAULT_CENTER.lat);
      setMapLng(DEFAULT_CENTER.lng);
      return;
    }

    // 이미 좌표가 있으면 사용
    if (cemetery.lat && cemetery.lng && 
        typeof cemetery.lat === 'number' && typeof cemetery.lng === 'number' &&
        cemetery.lat !== 0 && cemetery.lng !== 0 &&
        !isNaN(cemetery.lat) && !isNaN(cemetery.lng)) {
      setMapLat(cemetery.lat);
      setMapLng(cemetery.lng);
      console.log('[MAP] Using existing coordinates:', cemetery.lat, cemetery.lng);
      return;
    }

    // 주소가 있으면 Geocoding으로 좌표 가져오기
    const address = cemetery.address || 
      [cemetery.province, cemetery.city, cemetery.district]
        .filter(Boolean)
        .join(' ');

    if (address && address.trim() !== '') {
      // API 키가 있으면 Geocoding 시도
      if (hasMapApiKey) {
        console.log('[MAP] Geocoding address:', address);
        fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Geocoding failed: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            if (data.lat && data.lng && 
                typeof data.lat === 'number' && typeof data.lng === 'number') {
              setMapLat(data.lat);
              setMapLng(data.lng);
              console.log('[MAP] Geocoding success:', data.lat, data.lng);
            } else {
              console.warn('[MAP] Geocoding failed - invalid response:', data);
              // 기본 좌표 사용
              setMapLat(DEFAULT_CENTER.lat);
              setMapLng(DEFAULT_CENTER.lng);
            }
          })
          .catch((error) => {
            console.error('[MAP] Geocoding error:', error);
            // 기본 좌표 사용
            setMapLat(DEFAULT_CENTER.lat);
            setMapLng(DEFAULT_CENTER.lng);
          });
      } else {
        // API 키가 없으면 기본 좌표 사용
        console.log('[MAP] No API key, using default center');
        setMapLat(DEFAULT_CENTER.lat);
        setMapLng(DEFAULT_CENTER.lng);
      }
    } else {
      // 주소가 없으면 기본 좌표 사용
      setMapLat(DEFAULT_CENTER.lat);
      setMapLng(DEFAULT_CENTER.lng);
    }
  }, [cemetery, hasMapApiKey]);

  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Honeypot 체크
    if (contactForm.honeypot) {
      return;
    }

    // 기본 검증: 이름 / 연락처 필수
    if (!contactForm.name || !contactForm.phone) {
      let message = '';
      if (!contactForm.name && !contactForm.phone) {
        message = t('contact.missingRequired');
      } else if (!contactForm.name) {
        message = t('contact.missingName');
      } else {
        message = t('contact.missingPhone');
      }
      setContactError(message);
      if (typeof window !== 'undefined') {
        alert(message);
      }
      return;
    }

    setIsSubmitting(true);
    setContactError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          phone: contactForm.phone,
          time: contactForm.time,
          // 장지 이름을 메모 상단에 고정으로 포함
          note: `장지: ${cemetery ? cemetery.name : ''}\n${contactForm.note || ''}`,
        }),
      });

      if (!response.ok) {
        throw new Error('submit failed');
      }

      setIsSubmitted(true);
      setContactForm({
        name: '',
        phone: '',
        time: '',
        note: '',
        honeypot: '',
      });
    } catch (error) {
      console.error('[CONTACT] submit error:', error);
      setContactError(t('contact.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cemetery) {
    return (
      <Section>
        <div className="text-center py-12">
          <p className="text-lg opacity-60">
            {t('detail.notFound')}
          </p>
          <button
            onClick={() => router.push(`/${locale}/cemeteries`)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            {t('detail.back')}
          </button>
        </div>
      </Section>
    );
  }

  const mainImage = cemetery.mainImage || cemetery.image || '';
  const additionalImages = cemetery.images || [];
  const types = cemetery.types || 
    (cemetery.type ? cemetery.type.split(',').map(t => t.trim()) : []);

  return (
    <Section>
      <button
        onClick={() => router.back()}
        className="mb-6 text-primary hover:underline flex items-center gap-2"
      >
        <span>←</span>
        {t('detail.back')}
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{cemetery.name}</h1>

        {types.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {types.map((type, index) => (
              <span
                key={index}
                className="px-4 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* 대표 이미지 - 맨 위에 크게 표시 */}
        {mainImage && (
          <div className="mb-6">
            <img
              src={mainImage}
              alt={cemetery.name}
              className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* 추가 이미지들 - 3개씩 한 줄로 작게 표시 */}
        {additionalImages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {t('detail.additionalPhotos')}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {additionalImages.map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-xl shadow-md">
                  <img
                    src={image}
                    alt={`${cemetery.name} - ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => {
                      // 클릭 시 큰 이미지로 보기 (선택사항)
                      window.open(image, '_blank');
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 장지 정보 */}
        <div className="space-y-4 bg-white rounded-2xl p-6 shadow-md">
          {cemetery.address && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t('detail.address')}
              </h3>
              <p className="text-gray-900">{cemetery.address}</p>
            </div>
          )}

          {!cemetery.address && (cemetery.province || cemetery.city || cemetery.district) && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t('detail.address')}
              </h3>
              <p className="text-gray-900">
                {[cemetery.province, cemetery.city, cemetery.district]
                  .filter(Boolean)
                  .join(' ')}
              </p>
            </div>
          )}

          {cemetery.hours && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t('detail.hours')}
              </h3>
              <p className="text-gray-900">{cemetery.hours}</p>
            </div>
          )}

          {cemetery.phone && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t('detail.contact')}
              </h3>
              <a
                href={`tel:${cemetery.phone.replace(/-/g, '').replace(/\+/g, '')}`}
                className="text-primary hover:underline"
              >
                {cemetery.phone}
              </a>
            </div>
          )}

          {cemetery.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t('detail.description')}
              </h3>
              <p className="text-gray-900 whitespace-pre-wrap">{cemetery.description}</p>
            </div>
          )}

          {/* 구글 지도 - 설명 바로 아래 */}
          {(cemetery.address || cemetery.province || cemetery.city || cemetery.district) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                {t('detail.location')}
              </h3>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <GoogleMapComponent
                  address={
                    cemetery.address ||
                    [cemetery.province, cemetery.city, cemetery.district]
                      .filter(Boolean)
                      .join(' ')
                  }
                  lat={mapLat}
                  lng={mapLng}
                  name={cemetery.name}
                />
              </div>
            </div>
          )}
        </div>

        {/* 문의하기 폼 - 장지 상세 페이지 전용 */}
        <div className="mt-10 bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {t('contact.title')}
          </h2>

          {isSubmitted ? (
            <div className="p-4 rounded-xl bg-green-50 text-green-700">
              {t('contact.ok')}
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="grid gap-4">
              {/* Honeypot */}
              <input
                type="text"
                name="honeypot"
                value={contactForm.honeypot}
                onChange={(e) =>
                  setContactForm({ ...contactForm, honeypot: e.target.value })
                }
                className="sr-only"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* 장지 이름 - 항상 현재 페이지 장지명으로 고정 */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {t('contact.cemeteryName')}
                </label>
                <input
                  type="text"
                  value={cemetery.name}
                  readOnly
                  className="px-3 py-2 rounded-xl bg-gray-100 border border-primary/10 text-gray-700 w-full"
                />
              </div>

              <input
                type="text"
                placeholder={t('contact.name')}
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm({ ...contactForm, name: e.target.value })
                }
                className="px-3 py-2 rounded-xl bg-white border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('contact.name')}
              />
              <input
                type="tel"
                placeholder={t('contact.phone')}
                value={contactForm.phone}
                onChange={(e) =>
                  setContactForm({ ...contactForm, phone: e.target.value })
                }
                className="px-3 py-2 rounded-xl bg-white border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('contact.phone')}
              />
              <input
                type="text"
                placeholder={t('contact.time')}
                value={contactForm.time}
                onChange={(e) =>
                  setContactForm({ ...contactForm, time: e.target.value })
                }
                className="px-3 py-2 rounded-xl bg-white border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('contact.time')}
              />
              <textarea
                placeholder={t('contact.note')}
                value={contactForm.note}
                onChange={(e) =>
                  setContactForm({ ...contactForm, note: e.target.value })
                }
                rows={4}
                className="px-3 py-2 rounded-xl bg-white border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('contact.note')}
              />

              {contactError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                  {contactError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-3 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('contact.sending') : t('contact.submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}
