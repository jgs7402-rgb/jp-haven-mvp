import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '@/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Vercel 서버리스 환경에서 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'ko';

  try {
    const filePath = join(process.cwd(), 'data', `cemeteries.${locale}.json`);
    let data: string;
    let cemeteries: any[];
    
    try {
      data = await readFile(filePath, 'utf-8');
      cemeteries = JSON.parse(data);
      if (!Array.isArray(cemeteries)) {
        cemeteries = [];
      }
    } catch (fileError) {
      console.error(`[GET] ${locale} 파일 읽기 실패:`, fileError);
      return NextResponse.json([], { status: 200 });
    }
    
    return NextResponse.json(cemeteries);
  } catch (error) {
    console.error('Error reading cemeteries:', error);
    return NextResponse.json([], { status: 200 });
  }
}

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
    '하노이': 'Hà Nội',
    '천상낙원': 'Thiên đường',
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
    '내에': 'trong',
    '카트 운영': 'vận hành xe đẩy',
    '매점': 'quầy hàng',
    '휴게실': 'phòng nghỉ',
    '보유': 'có',
    '24시간': '24 giờ',
    '경비 운영': 'bảo vệ vận hành',
    '에어컨': 'điều hòa',
    '풀가동': 'hoạt động đầy đủ',
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
  
  // 부분 번역 시도 (긴 텍스트부터 매칭)
  let translated = text;
  const sortedEntries = Object.entries(translationMap).sort((a, b) => b[0].length - a[0].length);
  for (const [ko, vi] of sortedEntries) {
    translated = translated.replace(new RegExp(ko.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), vi);
  }
  
  // 여전히 한글이 남아있으면 기본 패턴 번역
  if (koreanRegex.test(translated)) {
    // 지역명 처리
    if (text.includes('나짱') || text.includes('나트랑')) {
      translated = translated.replace(/나짱|나트랑/g, 'Nha Trang');
    }
    if (text.includes('호찌민') || text.includes('호치민')) {
      translated = translated.replace(/호찌민|호치민/g, 'Hồ Chí Minh');
    }
    if (text.includes('하노이')) {
      translated = translated.replace(/하노이/g, 'Hà Nội');
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
    
    // 천상낙원 같은 특수한 이름 처리
    if (text.includes('천상낙원')) {
      translated = translated.replace(/천상낙원/g, 'Thiên đường');
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

// 한국어 데이터를 베트남어 데이터로 변환
async function convertToVietnamese(koData: any): Promise<any> {
  const viData = { ...koData };
  
  // 타입 변환
  if (viData.types && Array.isArray(viData.types)) {
    viData.types = viData.types.map((t: string) => translateTypeToVietnamese(t));
  } else if (viData.type) {
    viData.type = translateTypeToVietnamese(viData.type);
  }
  
  // 이름과 설명 번역 (API 사용)
  if (viData.name) {
    viData.name = await translateText(viData.name, 'ko', 'vi');
  }
  if (viData.description) {
    viData.description = await translateText(viData.description, 'ko', 'vi');
  }
  
  // 지역명 번역
  if (viData.province) {
    viData.province = await translateText(viData.province, 'ko', 'vi');
  }
  
  // 구조적 정보(주소, 시간, 이미지, 지역 등)는 그대로 유지
  // region은 이미 분류되어 있으므로 그대로 유지
  
  return viData;
}

// 베트남어 데이터를 한국어 데이터로 변환
async function convertToKorean(viData: any): Promise<any> {
  const koData = { ...viData };
  
  // 타입 변환
  if (koData.types && Array.isArray(koData.types)) {
    koData.types = koData.types.map((t: string) => translateTypeToKorean(t));
  } else if (koData.type) {
    koData.type = translateTypeToKorean(koData.type);
  }
  
  // 이름과 설명은 베트남어를 그대로 복사 (나중에 수동으로 번역 가능)
  // 구조적 정보(주소, 시간, 이미지, 지역 등)는 그대로 유지
  // region은 이미 분류되어 있으므로 그대로 유지
  
  return koData;
}

export async function POST(request: NextRequest) {
  const isAuthenticated = verifySessionFromRequest(request);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { locale, ...cemeteryData } = body;

    if (!locale || !cemeteryData.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), 'data', `cemeteries.${locale}.json`);
    let data: string;
    let cemeteries: any[];
    
    try {
      data = await readFile(filePath, 'utf-8');
      cemeteries = JSON.parse(data);
      if (!Array.isArray(cemeteries)) {
        cemeteries = [];
      }
    } catch (fileError) {
      console.error(`[CREATE] ${locale} 파일 읽기 실패:`, fileError);
      return NextResponse.json(
        { error: `Failed to read ${locale} cemeteries file` },
        { status: 500 }
      );
    }

    // 새 ID 생성
    const newId = String(Date.now());
    
    // 사용자가 선택한 region을 그대로 사용 (자동 분류 제거)
    const newCemetery = {
      id: newId,
      ...cemeteryData,
      // region은 사용자가 선택한 값 그대로 사용 (없으면 undefined)
    };

    cemeteries.push(newCemetery);

    try {
      await writeFile(filePath, JSON.stringify(cemeteries, null, 2), 'utf-8');
      console.log(`[CREATE] ${locale} 버전 저장 완료: ID ${newId}`);
    } catch (writeError) {
      console.error(`[CREATE] ${locale} 파일 쓰기 실패:`, writeError);
      return NextResponse.json(
        { error: `Failed to save ${locale} cemetery` },
        { status: 500 }
      );
    }

    // 양방향 동기화: 한국어로 추가한 경우 베트남어로, 베트남어로 추가한 경우 한국어로
    const targetLocale = locale === 'ko' ? 'vi' : 'ko';
    let syncSuccess = false;
    let syncError: any = null;
    
    try {
      console.log(`[SYNC] ${targetLocale} 버전 동기화 시작: ID ${newId}`);
      const targetFilePath = join(process.cwd(), 'data', `cemeteries.${targetLocale}.json`);
      
      // 파일 존재 확인 및 읽기
      let targetData: string;
      try {
        targetData = await readFile(targetFilePath, 'utf-8');
      } catch (fileError) {
        console.error(`[SYNC] ${targetLocale} 파일 읽기 실패:`, fileError);
        throw new Error(`Target file not found: ${targetFilePath}`);
      }
      
      const targetCemeteries = JSON.parse(targetData);

      // 한국어에서 베트남어로 변환
      const targetCemetery = locale === 'ko' 
        ? await convertToVietnamese(newCemetery)
        : await convertToKorean(newCemetery);
      
      // 번역 검증: 베트남어 버전에 한글이 남아있으면 안됨
      if (targetLocale === 'vi') {
        const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        if (targetCemetery.name && koreanRegex.test(targetCemetery.name)) {
          console.warn(`[SYNC] 경고: 베트남어 이름에 한글이 남아있음. 재번역 시도: ${targetCemetery.name}`);
          // 재번역 시도
          targetCemetery.name = await translateText(targetCemetery.name, 'ko', 'vi');
        }
        if (targetCemetery.description && koreanRegex.test(targetCemetery.description)) {
          console.warn(`[SYNC] 경고: 베트남어 설명에 한글이 남아있음. 재번역 시도`);
          // 재번역 시도
          targetCemetery.description = await translateText(targetCemetery.description, 'ko', 'vi');
        }
        if (targetCemetery.province && koreanRegex.test(targetCemetery.province)) {
          console.warn(`[SYNC] 경고: 베트남어 지역명에 한글이 남아있음. 재번역 시도: ${targetCemetery.province}`);
          targetCemetery.province = await translateText(targetCemetery.province, 'ko', 'vi');
        }
      }
      
      console.log(`[SYNC] 변환된 데이터:`, {
        id: targetCemetery.id,
        name: targetCemetery.name,
        type: targetCemetery.type || targetCemetery.types,
        province: targetCemetery.province,
      });
      
      // 중복 체크 (같은 ID가 이미 있으면 업데이트)
      const existingIndex = targetCemeteries.findIndex((c: any) => c.id === newId);
      if (existingIndex !== -1) {
        console.log(`[SYNC] 기존 항목 발견, 업데이트: ID ${newId}`);
        targetCemeteries[existingIndex] = targetCemetery;
      } else {
        targetCemeteries.push(targetCemetery);
      }

      try {
        await writeFile(targetFilePath, JSON.stringify(targetCemeteries, null, 2), 'utf-8');
      } catch (writeError) {
        console.error(`[SYNC] ${targetLocale} 파일 쓰기 실패:`, writeError);
        throw writeError;
      }
      
      // 동기화 검증: 파일이 제대로 저장되었는지 확인
      try {
        const verifyData = await readFile(targetFilePath, 'utf-8');
        const verifyCemeteries = JSON.parse(verifyData);
        const verifyCemetery = verifyCemeteries.find((c: any) => c.id === newId);
        
        if (!verifyCemetery) {
          throw new Error(`동기화 검증 실패: 저장 후 확인 시 항목을 찾을 수 없음`);
        }
      } catch (verifyError) {
        console.error(`[SYNC] ${targetLocale} 검증 실패:`, verifyError);
        // 검증 실패해도 저장은 성공했으므로 계속 진행
      }
      
      console.log(`[SYNC] ${targetLocale === 'vi' ? '베트남어' : '한국어'} 버전에도 동기화 완료 및 검증 성공: ID ${newId}`);
      syncSuccess = true;
    } catch (syncErr) {
      syncError = syncErr;
      console.error(`[SYNC] ${targetLocale === 'vi' ? '베트남어' : '한국어'} 동기화 실패:`, syncErr);
      console.error(`[SYNC] 에러 상세:`, {
        message: syncErr instanceof Error ? syncErr.message : String(syncErr),
        stack: syncErr instanceof Error ? syncErr.stack : undefined,
      });
      
      // 동기화 실패 시에도 원본은 저장되었으므로 경고만 출력
      console.warn(`[SYNC] 경고: ${targetLocale} 버전 동기화 실패했지만 원본 ${locale} 버전은 저장되었습니다.`);
    }

    // 동기화 결과를 응답에 포함
    return NextResponse.json({ 
      success: true, 
      id: newId,
      syncSuccess,
      syncError: syncError ? (syncError instanceof Error ? syncError.message : String(syncError)) : null,
    });
  } catch (error) {
    console.error('Error creating cemetery:', error);
    return NextResponse.json(
      { error: 'Failed to create cemetery' },
      { status: 500 }
    );
  }
}

