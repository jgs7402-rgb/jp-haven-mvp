'use client';

import { useState, useEffect } from 'react';
import GoogleMapComponent from '@/components/common/GoogleMap';

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
  lat?: number;
  lng?: number;
};

interface CemeteryDetailModalProps {
  cemetery: Cemetery;
  onClose: () => void;
  onSelectImage?: (imageUrl: string) => void;
}

export default function CemeteryDetailModal({
  cemetery,
  onClose,
  onSelectImage,
}: CemeteryDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mapLat, setMapLat] = useState<number | undefined>(undefined);
  const [mapLng, setMapLng] = useState<number | undefined>(undefined);
  const [hasMapApiKey, setHasMapApiKey] = useState(false);

  const allImages = [
    cemetery.mainImage || cemetery.image,
    ...(cemetery.images || []),
  ].filter(Boolean) as string[];

  const types = cemetery.types || 
    (cemetery.type ? cemetery.type.split(',').map(t => t.trim()) : []);

  // API 키 확인
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    setHasMapApiKey(
      !!apiKey && 
      apiKey !== 'your_google_maps_api_key_here' && 
      apiKey.trim() !== ''
    );
  }, []);

  // 주소를 좌표로 변환
  useEffect(() => {
    // 이미 좌표가 있으면 사용
    if (cemetery.lat && cemetery.lng && cemetery.lat !== 0 && cemetery.lng !== 0) {
      setMapLat(cemetery.lat);
      setMapLng(cemetery.lng);
      return;
    }

    // 주소가 있으면 Geocoding으로 좌표 가져오기
    const address = cemetery.address || 
      [cemetery.province, cemetery.city, cemetery.district]
        .filter(Boolean)
        .join(' ');

    if (address && hasMapApiKey) {
      fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.lat && data.lng) {
            setMapLat(data.lat);
            setMapLng(data.lng);
          }
        })
        .catch((error) => {
          console.error('Geocoding error:', error);
        });
    }
  }, [cemetery, hasMapApiKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{cemetery.name}</h2>
              {types.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {types.map((type, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {allImages.length > 0 && (
            <div className="mb-6">
              <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden bg-gray-100 mb-4">
                <img
                  src={allImages[selectedImageIndex]}
                  alt={cemetery.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index
                          ? 'border-primary'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${cemetery.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              {onSelectImage && (
                <button
                  onClick={() => {
                    onSelectImage(allImages[selectedImageIndex]);
                    onClose();
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  이 이미지 선택
                </button>
              )}
            </div>
          )}

          <div className="space-y-4">
            {cemetery.address && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">주소</h3>
                <p className="text-gray-900">{cemetery.address}</p>
              </div>
            )}
            {!cemetery.address && (cemetery.province || cemetery.city || cemetery.district) && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">주소</h3>
                <p className="text-gray-900">
                  {[cemetery.province, cemetery.city, cemetery.district]
                    .filter(Boolean)
                    .join(' ')}
                </p>
              </div>
            )}
            {cemetery.hours && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">운영시간</h3>
                <p className="text-gray-900">{cemetery.hours}</p>
              </div>
            )}
            {cemetery.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">설명</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{cemetery.description}</p>
              </div>
            )}
          </div>

          {/* 구글 지도 */}
          {hasMapApiKey && (cemetery.address || cemetery.province || cemetery.city || cemetery.district) && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">위치</h3>
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
      </div>
    </div>
  );
}

