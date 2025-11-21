import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// 한국어 타입을 베트남어로 변환
function translateTypeToVietnamese(type: string): string {
  const typeMap: Record<string, string> = {
    '공원묘원': 'Công viên nghĩa trang',
    '수목장': 'Nghĩa trang sinh thái',
    '납골당': 'Nhà lưu tro',
    '화장장': 'Hỏa táng',
  };
  return typeMap[type] || type;
}

// 베트남어 타입을 한국어로 변환
function translateTypeToKorean(type: string): string {
  const typeMap: Record<string, string> = {
    'Công viên nghĩa trang': '공원묘원',
    'Nghĩa trang sinh thái': '수목장',
    'Nhà lưu tro': '납골당',
    'Hỏa táng': '화장장',
  };
  return typeMap[type] || type;
}

// 한국어 텍스트를 베트남어로 번역 (기본 패턴)
function translateTextToVietnamese(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  // 기본 번역 맵
  const translationMap: Record<string, string> = {
    '공원묘원': 'Công viên nghĩa trang',
    '수목장': 'Nghĩa trang sinh thái',
    '납골당': 'Nhà lưu tro',
    '화장장': 'Hỏa táng',
    '나짱': 'Nha Trang',
    '나트랑': 'Nha Trang',
    '호찌민': 'Hồ Chí Minh',
    '호치민': 'Hồ Chí Minh',
    '빈홈': 'Vinhomes',
    '자연친화형': 'thân thiện với thiên nhiên',
    '넓은 부지': 'khuôn viên rộng lớn',
    '아름다운 조경': 'cảnh quan đẹp',
    '생태 친화적': 'thân thiện với môi trường',
    '안치 가능한': 'có thể an táng',
    '실내': 'trong nhà',
    '봉안당': 'khu lưu tro',
    '깔끔하고 정돈된': 'sạch sẽ và gọn gàng',
    '시설': 'cơ sở vật chất',
    '현대적인': 'hiện đại',
    '화장 시설': 'hỏa táng',
    '봉안 시설': 'khu lưu tro',
    '종합 장례 시설': 'cơ sở tang lễ tổng hợp',
    '종교 시설': 'cơ sở tôn giáo',
    '다양한 장례 방식': 'nhiều hình thức tang lễ',
    '지원': 'hỗ trợ',
  };
  
  // 한글이 포함되어 있으면 번역 시도
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  if (!koreanRegex.test(text)) {
    return text; // 한글이 없으면 그대로 반환
  }
  
  // 번역 맵에서 직접 매칭되는 경우
  if (translationMap[text]) {
    return translationMap[text];
  }
  
  // 부분 번역 시도
  let translated = text;
  for (const [ko, vi] of Object.entries(translationMap)) {
    translated = translated.replace(new RegExp(ko, 'g'), vi);
  }
  
  // 여전히 한글이 남아있으면 기본 번역 시도
  if (koreanRegex.test(translated)) {
    // 지역명 처리
    if (text.includes('나짱') || text.includes('나트랑')) {
      translated = translated.replace(/나짱|나트랑/g, 'Nha Trang');
    }
    if (text.includes('호찌민') || text.includes('호치민')) {
      translated = translated.replace(/호찌민|호치민/g, 'Hồ Chí Minh');
    }
    
    // 기본 패턴 번역
    if (text.includes('공원묘원')) {
      translated = translated.replace(/공원묘원/g, 'Công viên nghĩa trang');
    }
    if (text.includes('수목장')) {
      translated = translated.replace(/수목장/g, 'Nghĩa trang sinh thái');
    }
    if (text.includes('납골당')) {
      translated = translated.replace(/납골당/g, 'Nhà lưu tro');
    }
    if (text.includes('화장장')) {
      translated = translated.replace(/화장장/g, 'Hỏa táng');
    }
  }
  
  return translated;
}

// 번역 API를 사용하여 텍스트 번역
async function translateText(text: string, source: string = 'ko', target: string = 'vi'): Promise<string> {
  if (!text || typeof text !== 'string') return text;
  
  // 한글이 없으면 그대로 반환
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  if (source === 'ko' && !koreanRegex.test(text)) {
    return text;
  }
  
  try {
    // 먼저 기본 번역 맵 사용
    const basicTranslation = translateTextToVietnamese(text);
    if (basicTranslation !== text && !koreanRegex.test(basicTranslation)) {
      return basicTranslation;
    }
    
    // 번역 API 호출 (서버 내부에서만)
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
    if (apiKey) {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: source,
            target: target,
          }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.data?.translations?.[0]?.translatedText) {
          return data.data.translations[0].translatedText;
        }
      }
    }
    
    // API 실패 시 기본 번역 반환
    return basicTranslation;
  } catch (error) {
    console.error('[TRANSLATE] Translation error:', error);
    return translateTextToVietnamese(text);
  }
}

// 한국어 데이터를 베트남어 데이터로 변환 (구조적 정보만 동기화)
async function syncToVietnamese(koData: any, existingViData?: any): Promise<any> {
  const viData = existingViData ? { ...existingViData } : {};
  
  // ID는 유지
  viData.id = koData.id;
  
  // 구조적 정보 동기화 (주소, 시간, 이미지 등)
  if (koData.address) viData.address = koData.address;
  if (koData.province) viData.province = await translateText(koData.province, 'ko', 'vi');
  if (koData.city) viData.city = koData.city;
  if (koData.district) viData.district = koData.district;
  if (koData.hours) viData.hours = koData.hours;
  if (koData.phone) viData.phone = koData.phone;
  if (koData.mainImage) viData.mainImage = koData.mainImage;
  if (koData.image) viData.image = koData.image;
  if (koData.images) viData.images = koData.images;
  if (koData.lat !== undefined) viData.lat = koData.lat;
  if (koData.lng !== undefined) viData.lng = koData.lng;
  if (koData.region) viData.region = koData.region; // 지역 정보 동기화
  if (koData.budget_min !== undefined) viData.budget_min = koData.budget_min;
  if (koData.budget_max !== undefined) viData.budget_max = koData.budget_max;
  if (koData.cremation !== undefined) viData.cremation = koData.cremation;
  if (koData.burial !== undefined) viData.burial = koData.burial;
  if (koData.columbarium !== undefined) viData.columbarium = koData.columbarium;
  if (koData.religious !== undefined) viData.religious = koData.religious;
  
  // 타입 변환
  if (koData.types && Array.isArray(koData.types)) {
    viData.types = koData.types.map((t: string) => translateTypeToVietnamese(t));
  } else if (koData.type) {
    viData.type = translateTypeToVietnamese(koData.type);
  }
  
  // 이름과 설명 번역 (기존 베트남어 데이터가 없거나 한글이 포함된 경우에만)
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  if (koData.name) {
    if (!viData.name || koreanRegex.test(viData.name)) {
      viData.name = await translateText(koData.name, 'ko', 'vi');
    }
  }
  if (koData.description) {
    if (!viData.description || koreanRegex.test(viData.description)) {
      viData.description = await translateText(koData.description, 'ko', 'vi');
    }
  }
  
  // 최종 검증: 베트남어 버전에 한글이 남아있으면 안됨
  if (viData.name && koreanRegex.test(viData.name)) {
    console.warn(`[SYNC] 경고: 베트남어 이름에 한글이 남아있음. 재번역 시도: ${viData.name}`);
    viData.name = await translateText(viData.name, 'ko', 'vi');
  }
  if (viData.description && koreanRegex.test(viData.description)) {
    console.warn(`[SYNC] 경고: 베트남어 설명에 한글이 남아있음. 재번역 시도`);
    viData.description = await translateText(viData.description, 'ko', 'vi');
  }
  if (viData.province && koreanRegex.test(viData.province)) {
    console.warn(`[SYNC] 경고: 베트남어 지역명에 한글이 남아있음. 재번역 시도: ${viData.province}`);
    viData.province = await translateText(viData.province, 'ko', 'vi');
  }
  
  return viData;
}

// 베트남어 데이터를 한국어 데이터로 변환 (구조적 정보만 동기화)
function syncToKorean(viData: any, existingKoData?: any): any {
  const koData = existingKoData ? { ...existingKoData } : {};
  
  // ID는 유지
  koData.id = viData.id;
  
  // 구조적 정보 동기화 (주소, 시간, 이미지 등)
  if (viData.address) koData.address = viData.address;
  if (viData.province) koData.province = viData.province;
  if (viData.city) koData.city = viData.city;
  if (viData.district) koData.district = viData.district;
  if (viData.hours) koData.hours = viData.hours;
  if (viData.phone) koData.phone = viData.phone;
  if (viData.mainImage) koData.mainImage = viData.mainImage;
  if (viData.image) koData.image = viData.image;
  if (viData.images) koData.images = viData.images;
  if (viData.lat !== undefined) koData.lat = viData.lat;
  if (viData.lng !== undefined) koData.lng = viData.lng;
  if (viData.region) koData.region = viData.region; // 지역 정보 동기화
  if (viData.budget_min !== undefined) koData.budget_min = viData.budget_min;
  if (viData.budget_max !== undefined) koData.budget_max = viData.budget_max;
  if (viData.cremation !== undefined) koData.cremation = viData.cremation;
  if (viData.burial !== undefined) koData.burial = viData.burial;
  if (viData.columbarium !== undefined) koData.columbarium = viData.columbarium;
  if (viData.religious !== undefined) koData.religious = viData.religious;
  
  // 타입 변환
  if (viData.types && Array.isArray(viData.types)) {
    koData.types = viData.types.map((t: string) => translateTypeToKorean(t));
  } else if (viData.type) {
    koData.type = translateTypeToKorean(viData.type);
  }
  
  // 이름과 설명은 기존 한국어 데이터 유지 (없으면 베트남어 복사)
  if (!koData.name) koData.name = viData.name;
  if (!koData.description) koData.description = viData.description;
  
  return koData;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { locale, ...cemeteryData } = body;

    if (!locale) {
      return NextResponse.json(
        { error: 'Missing locale' },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), 'data', `cemeteries.${locale}.json`);
    const data = await readFile(filePath, 'utf-8');
    const cemeteries = JSON.parse(data);

    const index = cemeteries.findIndex((c: any) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 사용자가 선택한 region을 그대로 사용 (자동 분류 제거)
    cemeteries[index] = { 
      id, 
      ...cemeteryData,
      // region은 사용자가 선택한 값 그대로 사용 (없으면 undefined)
    };

    await writeFile(filePath, JSON.stringify(cemeteries, null, 2), 'utf-8');

    // 양방향 동기화: 한국어로 수정한 경우 베트남어로, 베트남어로 수정한 경우 한국어로
    const targetLocale = locale === 'ko' ? 'vi' : 'ko';
    try {
      const targetFilePath = join(process.cwd(), 'data', `cemeteries.${targetLocale}.json`);
      const targetData = await readFile(targetFilePath, 'utf-8');
      const targetCemeteries = JSON.parse(targetData);

      const targetIndex = targetCemeteries.findIndex((c: any) => c.id === id);
      if (targetIndex !== -1) {
        // 기존 데이터가 있으면 구조적 정보만 동기화
        if (locale === 'ko') {
          targetCemeteries[targetIndex] = await syncToVietnamese({ id, ...cemeteryData }, targetCemeteries[targetIndex]);
        } else {
          targetCemeteries[targetIndex] = syncToKorean({ id, ...cemeteryData }, targetCemeteries[targetIndex]);
        }
      } else {
        // 대상 언어 데이터가 없으면 새로 생성
        if (locale === 'ko') {
          const viCemetery = await syncToVietnamese({ id, ...cemeteryData });
          targetCemeteries.push(viCemetery);
        } else {
          const koCemetery = syncToKorean({ id, ...cemeteryData });
          targetCemeteries.push(koCemetery);
        }
      }

      await writeFile(targetFilePath, JSON.stringify(targetCemeteries, null, 2), 'utf-8');
      console.log(`[SYNC] ${targetLocale === 'vi' ? '베트남어' : '한국어'} 버전에도 동기화 완료: ID ${id}`);
    } catch (syncError) {
      console.error(`[SYNC] ${targetLocale === 'vi' ? '베트남어' : '한국어'} 동기화 실패:`, syncError);
      // 동기화 실패해도 원본 수정은 성공했으므로 계속 진행
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cemetery:', error);
    return NextResponse.json(
      { error: 'Failed to update cemetery' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'ko';

    const filePath = join(process.cwd(), 'data', `cemeteries.${locale}.json`);
    const data = await readFile(filePath, 'utf-8');
    const cemeteries = JSON.parse(data);

    const filtered = cemeteries.filter((c: any) => c.id !== id);

    await writeFile(filePath, JSON.stringify(filtered, null, 2), 'utf-8');

    // 양방향 동기화: 어느 언어에서 삭제하든 양쪽 모두에서 삭제
    const targetLocale = locale === 'ko' ? 'vi' : 'ko';
    try {
      const targetFilePath = join(process.cwd(), 'data', `cemeteries.${targetLocale}.json`);
      const targetData = await readFile(targetFilePath, 'utf-8');
      const targetCemeteries = JSON.parse(targetData);

      const targetFiltered = targetCemeteries.filter((c: any) => c.id !== id);

      await writeFile(targetFilePath, JSON.stringify(targetFiltered, null, 2), 'utf-8');
      console.log(`[SYNC] ${targetLocale === 'vi' ? '베트남어' : '한국어'} 버전에서도 삭제 완료: ID ${id}`);
    } catch (syncError) {
      console.error(`[SYNC] ${targetLocale === 'vi' ? '베트남어' : '한국어'} 삭제 동기화 실패:`, syncError);
      // 동기화 실패해도 원본 삭제는 성공했으므로 계속 진행
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cemetery:', error);
    return NextResponse.json(
      { error: 'Failed to delete cemetery' },
      { status: 500 }
    );
  }
}

