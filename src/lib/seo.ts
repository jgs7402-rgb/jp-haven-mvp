/**
 * SEO Helper Utility
 * Generates multilingual SEO metadata for funeral process pages
 * Ensures Vietnamese metadata contains NO English words
 */

import { Metadata } from 'next';

interface SEOConfig {
  locale: 'ko' | 'vi';
  title?: string;
  description?: string;
  keywords?: string[];
}

/**
 * Generates SEO metadata for funeral process pages
 * @param config - SEO configuration with locale
 * @returns Next.js Metadata object
 */
export function generateProcessPageMetadata(config: SEOConfig): Metadata {
  const { locale } = config;

  if (locale === 'ko') {
    // Korean metadata
    return {
      title: config.title || '장례 절차 안내 | JP Haven Memorial',
      description:
        config.description ||
        'JP Haven Memorial의 장례 절차 안내 및 절차별 설명을 확인하세요.',
      keywords: config.keywords || [
        '장례 절차',
        '장례 절차 안내',
        '장례 절차 설명',
        'JP Haven',
        '장례 서비스',
      ],
      openGraph: {
        title: config.title || '장례 절차 안내 | JP Haven Memorial',
        description:
          config.description ||
          'JP Haven Memorial의 장례 절차 안내 및 절차별 설명을 확인하세요.',
        type: 'website',
        locale: 'ko_KR',
      },
    };
  } else {
    // Vietnamese metadata (NO English allowed)
    return {
      title: config.title || 'Quy trình tang lễ | JP Haven Memorial',
      description:
        config.description ||
        'Hướng dẫn từng bước trong quy trình tang lễ tại JP Haven Memorial',
      keywords: config.keywords || [
        'quy trình tang lễ',
        'hướng dẫn tang lễ',
        'các bước tang lễ',
        'JP Haven',
        'dịch vụ tang lễ',
      ],
      openGraph: {
        title: config.title || 'Quy trình tang lễ | JP Haven Memorial',
        description:
          config.description ||
          'Hướng dẫn từng bước trong quy trình tang lễ tại JP Haven Memorial',
        type: 'website',
        locale: 'vi_VN',
      },
    };
  }
}

/**
 * Generates page title for funeral process pages
 * @param locale - 'ko' or 'vi'
 * @returns Localized page title
 */
export function getProcessPageTitle(locale: 'ko' | 'vi'): string {
  return locale === 'ko' ? '장례 절차 안내' : 'Quy trình tang lễ';
}

/**
 * Generates page description for funeral process pages
 * @param locale - 'ko' or 'vi'
 * @returns Localized page description
 */
export function getProcessPageDescription(locale: 'ko' | 'vi'): string {
  return locale === 'ko'
    ? 'JP Haven Memorial의 장례 절차 안내 및 절차별 설명을 확인하세요.'
    : 'Hướng dẫn từng bước trong quy trình tang lễ tại JP Haven Memorial';
}

