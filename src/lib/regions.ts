import { readFile } from 'fs/promises';
import { join } from 'path';

const REGIONS_PATH = join(process.cwd(), 'data', 'regions.json');

export type RegionKey = 'north' | 'central' | 'south';

export interface Region {
  nameKo: string;
  nameVi: string;
  provinces: string[];
}

export interface RegionsData {
  north: Region;
  central: Region;
  south: Region;
}

// 지역 데이터 로드
export async function getRegions(): Promise<RegionsData> {
  try {
    const data = await readFile(REGIONS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    // 기본값 반환
    return {
      north: { nameKo: '북부', nameVi: 'Miền Bắc', provinces: [] },
      central: { nameKo: '중부', nameVi: 'Miền Trung', provinces: [] },
      south: { nameKo: '남부', nameVi: 'Miền Nam', provinces: [] },
    };
  }
}

// 주소 기반으로 지역 자동 분류
export function classifyRegionByAddress(
  address: string,
  regions: RegionsData,
  province?: string,
  city?: string
): RegionKey | null {
  const searchText = [address, province, city].filter(Boolean).join(' ').toLowerCase();

  // 북부 지역 확인
  for (const prov of regions.north.provinces) {
    if (searchText.includes(prov.toLowerCase())) {
      return 'north';
    }
  }

  // 중부 지역 확인
  for (const prov of regions.central.provinces) {
    if (searchText.includes(prov.toLowerCase())) {
      return 'central';
    }
  }

  // 남부 지역 확인
  for (const prov of regions.south.provinces) {
    if (searchText.includes(prov.toLowerCase())) {
      return 'south';
    }
  }

  return null;
}

