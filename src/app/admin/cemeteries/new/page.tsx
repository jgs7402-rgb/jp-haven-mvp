'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CEMETERY_TYPES = ['공원묘원', '수목장', '납골당', '화장장'];

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

type CemeteryFormData = {
  name: string;
  types: string[];
  address: string;
  hours: string;
  mainImage: string;
  images: string[];
  description: string;
  region: RegionKey | '';
  province: string;
};

export default function NewCemeteryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (searchParams.get('locale') || 'ko') as 'ko' | 'vi';
  
  const [formData, setFormData] = useState<CemeteryFormData>({
    name: '',
    types: [],
    address: '',
    hours: '09:00-18:00',
    mainImage: '',
    images: [],
    description: '',
    region: '',
    province: '',
  });
  const [selectedMainFile, setSelectedMainFile] = useState<File | null>(null);
  const [selectedAdditionalFiles, setSelectedAdditionalFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regions, setRegions] = useState<RegionsData | null>(null);

  // 지역 데이터 로드
  useEffect(() => {
    fetch('/api/regions')
      .then((res) => res.json())
      .then((data) => setRegions(data))
      .catch((err) => console.error('[REGIONS] Fetch error:', err));
  }, []);

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, types: [...formData.types, type] });
    } else {
      setFormData({ ...formData, types: formData.types.filter(t => t !== type) });
    }
  };

  const handleMainFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedMainFile(file);
    }
  };

  const handleAdditionalFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedAdditionalFiles(files);
    }
  };

  const handleMainImageUpload = async () => {
    if (!selectedMainFile) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', selectedMainFile);
    uploadFormData.append('type', 'cemetery');

    try {
      const response = await fetch('/api/admin/images', {
        method: 'POST',
        credentials: 'include',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, mainImage: data.url });
        setSelectedMainFile(null);
        alert('대표 이미지가 업로드되었습니다.');
      } else {
        alert('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImagesUpload = async () => {
    if (selectedAdditionalFiles.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of selectedAdditionalFiles) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('type', 'cemetery');

        const response = await fetch('/api/admin/images', {
          method: 'POST',
          credentials: 'include',
          body: uploadFormData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
        setSelectedAdditionalFiles([]);
        alert(`${uploadedUrls.length}개의 추가 이미지가 업로드되었습니다.`);
      }
    } catch (error) {
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.types.length === 0) {
      alert('최소 하나의 유형을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/cemeteries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          locale,
          name: formData.name,
          type: formData.types.join(', '), // 기존 호환성을 위해 문자열로 변환
          types: formData.types, // 새로운 배열 형식
          address: formData.address,
          hours: formData.hours,
          image: formData.mainImage, // 기존 호환성
          mainImage: formData.mainImage,
          images: formData.images,
          description: formData.description,
          // 기존 데이터 구조와 호환성을 위한 기본값
          city: '',
          district: '',
          phone: '',
          cremation: false,
          burial: false,
          columbarium: false,
          religious: false,
          budget_min: 0,
          budget_max: 0,
          lat: 0,
          lng: 0,
          region: formData.region || undefined,
          province: formData.province || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.syncSuccess === false) {
          alert(`저장은 완료되었지만 ${locale === 'ko' ? '베트남어' : '한국어'} 버전 동기화에 실패했습니다.\n에러: ${result.syncError || '알 수 없는 오류'}`);
        }
        router.push('/admin/cemeteries');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`저장에 실패했습니다.${errorData.error ? `\n에러: ${errorData.error}` : ''}`);
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">새 장지 추가</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="장지 이름을 입력하세요"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              유형 * (중복 선택 가능)
            </label>
            <div className="flex flex-wrap gap-4">
              {CEMETERY_TYPES.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.types.includes(type)}
                    onChange={(e) => handleTypeChange(type, e.target.checked)}
                    className="mr-2 w-4 h-4"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
            {formData.types.length === 0 && (
              <p className="mt-2 text-sm text-red-500">최소 하나의 유형을 선택해주세요.</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="예: 서울특별시 강남구 테헤란로 123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              운영시간
            </label>
            <input
              type="text"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              placeholder="09:00-18:00"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대분류 (지역)
            </label>
            <select
              value={formData.region}
              onChange={(e) => {
                const newRegion = e.target.value as RegionKey | '';
                setFormData({ 
                  ...formData, 
                  region: newRegion,
                  province: '', // 대분류 변경 시 소분류 초기화
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">대분류 선택</option>
              <option value="north">북부 (Miền Bắc)</option>
              <option value="central">중부 (Miền Trung)</option>
              <option value="south">남부 (Miền Nam)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              소분류 (도시/지역)
            </label>
            <select
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              disabled={!formData.region || !regions}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">소분류 선택</option>
              {formData.region && regions && regions[formData.region]?.provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {!formData.region && (
              <p className="mt-1 text-xs text-gray-500">먼저 대분류를 선택해주세요.</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대표 이미지
            </label>
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainFileSelect}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleMainImageUpload}
                  disabled={!selectedMainFile || uploading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {uploading ? '업로드 중...' : '업로드'}
                </button>
              </div>
              {formData.mainImage && (
                <div className="mt-2">
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={formData.mainImage}
                      alt="대표 이미지"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">대표 이미지: {formData.mainImage}</p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              추가 이미지 (여러 장 업로드 가능)
            </label>
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalFilesSelect}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAdditionalImagesUpload}
                  disabled={selectedAdditionalFiles.length === 0 || uploading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {uploading ? '업로드 중...' : '업로드'}
                </button>
              </div>
              {selectedAdditionalFiles.length > 0 && (
                <p className="text-sm text-gray-600">
                  {selectedAdditionalFiles.length}개의 파일이 선택되었습니다.
                </p>
              )}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={image}
                          alt={`추가 이미지 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="장지에 대한 설명을 입력하세요"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || formData.types.length === 0}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
