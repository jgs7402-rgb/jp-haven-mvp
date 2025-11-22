import { NextRequest, NextResponse } from 'next/server';

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
  '하롱베이': 'Vịnh Hạ Long',
  '사파': 'Sapa',
  '닌빈': 'Ninh Bình',
  '박닌': 'Bắc Ninh',
  '푸토': 'Phú Thọ',
  '빈푹': 'Vĩnh Phúc',
  '하남': 'Hà Nam',
  '타이응우옌': 'Thái Nguyên',
  '흥옌': 'Hưng Yên',
  '타이빈': 'Thái Bình',
  '꽝닌': 'Quảng Ninh',
  '박장': 'Bắc Giang',
  '박깐': 'Bắc Kạn',
  '까오방': 'Cao Bằng',
  '딘비엔': 'Điện Biên',
  '디엔비엔': 'Điện Biên',
  '라이쩌우': 'Lai Châu',
  '라오까이': 'Lào Cai',
  '옌바이': 'Yên Bái',
  '호이안': 'Hội An',
  '푸옌': 'Phú Yên',
  '꽝빈': 'Quảng Bình',
  '하띤': 'Hà Tĩnh',
  '꽝찌': 'Quảng Trị',
  '꽝남': 'Quảng Nam',
  '꽝응아이': 'Quảng Ngãi',
  '빈딘': 'Bình Định',
  '카인호아': 'Khánh Hòa',
  '닌투언': 'Ninh Thuận',
  '빈투언': 'Bình Thuận',
  '람동': 'Lâm Đồng',
  '닥락': 'Đắk Lắk',
  '닥농': 'Đắk Nông',
  '꼰뚬': 'Kon Tum',
  '자라이': 'Gia Lai',
  '메콩델타': 'Đồng bằng sông Cửu Long',
  '푸꾸옥': 'Phú Quốc',
  '빈즈엉': 'Bình Dương',
  '동나이': 'Đồng Nai',
  '바리어붕따우': 'Bà Rịa - Vũng Tàu',
  '떠이닌': 'Tây Ninh',
  '롱안': 'Long An',
  '띠엔장': 'Tiền Giang',
  '벤째': 'Bến Tre',
  '동탑': 'Đồng Tháp',
  '안장': 'An Giang',
  '끼엔장': 'Kiên Giang',
  '하우장': 'Hậu Giang',
  '소크짱': 'Sóc Trăng',
  '박리에우': 'Bạc Liêu',
  '까마우': 'Cà Mau',
  '껀터': 'Cần Thơ',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, source = 'ko', target = 'vi' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // 먼저 번역 맵에서 찾기
    if (translationMap[text]) {
      return NextResponse.json({ translatedText: translationMap[text] });
    }

    // Google Translate API 사용 (환경 변수 설정 시)
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
    
    if (apiKey) {
      try {
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
            return NextResponse.json({
              translatedText: data.data.translations[0].translatedText,
            });
          }
        }
      } catch (error) {
        console.error('[TRANSLATE] Google API error:', error);
        // API 실패 시 맵 결과 반환
      }
    }

    // 기본값: 입력된 텍스트 그대로 반환 (번역 실패)
    return NextResponse.json({ translatedText: text });
  } catch (error) {
    console.error('[TRANSLATE] Error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}


