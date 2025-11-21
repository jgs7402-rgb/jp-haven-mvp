'use client';

import { useMemo, useState, useEffect, useRef } from 'react';

type GoogleMapProps = {
  address?: string;
  lat?: number;
  lng?: number;
  name?: string;
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '400px',
  minHeight: '400px',
};

const defaultCenter = {
  lat: 37.5665, // 서울 기본 좌표
  lng: 126.9780,
};

// Google Maps 스크립트 로드 함수 (제공된 예제 기반)
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있는지 확인
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // 스크립트가 이미 로드 중인지 확인
    const existingScript = document.querySelector('script[data-google-maps]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    // 새로운 스크립트 로드 (제공된 예제 방식)
    const loaderScript = document.createElement('script');
    loaderScript.setAttribute('data-google-maps', 'true');
    loaderScript.innerHTML = `
      (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\${c}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})
      ({key: "${apiKey}", v: "weekly"});
    `;
    
    loaderScript.onload = () => {
      // 스크립트가 로드되면 약간의 지연 후 resolve
      setTimeout(() => {
        if (window.google && window.google.maps) {
          resolve();
        } else {
          reject(new Error('Google Maps API not available after script load'));
        }
      }, 100);
    };
    loaderScript.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(loaderScript);
  });
}

export default function GoogleMapComponent({ address, lat, lng, name }: GoogleMapProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // 클라이언트 사이드에서만 API 키 읽기
  useEffect(() => {
    setMounted(true);
    // Next.js에서 NEXT_PUBLIC_ 환경 변수는 빌드 타임에 번들에 포함됨
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    console.log('[MAP] API Key loaded:', {
      hasKey: !!key,
      keyLength: key.length,
      keyPrefix: key.substring(0, 10),
      isPlaceholder: key.includes('여기에_실제') || key.includes('your_google')
    });
    setApiKey(key);
  }, []);

  const center = useMemo(() => {
    if (lat && lng && typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
    return defaultCenter;
  }, [lat, lng]);

  // API 키 유효성 검사 (더 엄격하게)
  const isValidApiKey = useMemo(() => {
    if (!apiKey || apiKey.trim() === '') {
      console.log('[MAP] API Key validation: empty');
      return false;
    }
    
    // 플레이스홀더 값 체크
    const placeholderPatterns = [
      'your_google_maps_api_key_here',
      '여기에_실제_API_키_입력',
      '여기에_실제',
      'your_google',
      'INSERT_YOUR_API_KEY'
    ];
    
    const isPlaceholder = placeholderPatterns.some(pattern => 
      apiKey.includes(pattern)
    );
    
    if (isPlaceholder) {
      console.log('[MAP] API Key validation: placeholder detected');
      return false;
    }
    
    // 최소 길이 체크 (Google Maps API 키는 보통 39자)
    if (apiKey.length < 20) {
      console.log('[MAP] API Key validation: too short', apiKey.length);
      return false;
    }
    
    // Google Maps API 키는 보통 "AIza"로 시작
    const isValidFormat = apiKey.startsWith('AIza') || apiKey.length >= 30;
    
    if (!isValidFormat) {
      console.log('[MAP] API Key validation: invalid format');
      return false;
    }
    
    console.log('[MAP] API Key validation: valid');
    return true;
  }, [apiKey]);

  // Google Maps 스크립트 로드
  useEffect(() => {
    if (!mounted || !isValidApiKey) return;

    loadGoogleMapsScript(apiKey)
      .then(() => {
        setScriptLoaded(true);
        setLoadError(null);
      })
      .catch((error) => {
        console.error('Failed to load Google Maps:', error);
        setLoadError(error);
        setScriptLoaded(false);
      });
  }, [mounted, isValidApiKey, apiKey]);

  // 지도 초기화
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;

    let mapInstance: any = null;
    let markerInstance: any = null;

    const initMap = async () => {
      try {
        // window.google이 있는지 확인
        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps API not loaded');
        }

        const mapsLibrary = await window.google.maps.importLibrary('maps') as any;
        const markerLibrary = await window.google.maps.importLibrary('marker') as any;
        
        const Map = mapsLibrary.Map;
        const AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement;
        
        mapInstance = new Map(mapRef.current!, {
          center: center,
          zoom: (lat && lng) ? 15 : 10,
          mapId: 'DEMO_MAP_ID',
        });

        // 마커 추가
        if (lat && lng && typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
          markerInstance = new AdvancedMarkerElement({
            map: mapInstance,
            position: center,
            title: name || address || '위치',
          });
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setLoadError(error as Error);
      }
    };

    initMap();

    // Cleanup: 컴포넌트 언마운트 시 지도 제거
    return () => {
      if (markerInstance) {
        markerInstance.map = null;
      }
      if (mapInstance) {
        // 지도 인스턴스 정리
      }
    };
  }, [scriptLoaded, center, lat, lng, name, address]);

  // 마운트 전에는 로딩 표시
  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  // API 키가 없거나 유효하지 않은 경우 안내 메시지 표시
  if (!isValidApiKey) {
    const currentValue = apiKey || '(없음)';
    const displayValue = currentValue.length > 30 
      ? `${currentValue.substring(0, 30)}...` 
      : currentValue;
    const isPlaceholder = currentValue.includes('여기에_실제') || currentValue.includes('your_google') || currentValue.includes('INSERT_YOUR');
    
    return (
      <div className="w-full h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center px-6 max-w-lg">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-gray-700 font-semibold text-lg mb-1">지도를 표시하려면</p>
            <p className="text-sm text-gray-600">
              Google Maps API 키를 설정해주세요
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-2 text-left font-medium">설정 방법:</p>
            <ol className="text-xs text-gray-600 text-left space-y-2 mb-3">
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">1.</span>
                <span>프로젝트 루트의 <code className="bg-gray-100 px-1 rounded">.env.local</code> 파일 열기</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">2.</span>
                <span>다음 줄을 찾아서:</span>
              </li>
              <li className="ml-6">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono block">
                  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=여기에_실제_API_키_입력
                </code>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">3.</span>
                <span><code className="bg-gray-100 px-1 rounded">여기에_실제_API_키_입력</code>을 실제 API 키로 변경</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary mr-2">4.</span>
                <span>개발 서버 재시작 (<code className="bg-gray-100 px-1 rounded">npm run dev</code>)</span>
              </li>
            </ol>
            
            {isPlaceholder && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-3">
                <p className="text-xs text-yellow-800 text-left">
                  ⚠️ 현재 플레이스홀더 값이 설정되어 있습니다. 실제 API 키를 입력해주세요.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <a 
              href="https://console.cloud.google.com/google/maps-apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Google Cloud Console에서 API 키 발급받기
            </a>
          </div>
          
          <p className="text-xs text-gray-400 mt-4">
            현재 설정된 값: <span className="font-mono">{displayValue}</span>
          </p>
        </div>
      </div>
    );
  }

  // 스크립트 로드 오류
  if (loadError) {
    return (
      <div className="w-full h-[400px] bg-red-50 rounded-xl flex items-center justify-center border-2 border-red-200">
        <div className="text-center px-4">
          <p className="text-red-600 font-medium mb-2">지도 로드 오류</p>
          <p className="text-sm text-red-500">
            API 키를 확인해주세요
          </p>
          <p className="text-xs text-red-400 mt-2">
            {loadError.message || '알 수 없는 오류'}
          </p>
        </div>
      </div>
    );
  }

  // 스크립트 로딩 중
  if (!scriptLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-300">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-2">지도를 불러오는 중...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  // 지도 표시
  return (
    <div className="w-full h-[400px] relative rounded-xl overflow-hidden border border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

