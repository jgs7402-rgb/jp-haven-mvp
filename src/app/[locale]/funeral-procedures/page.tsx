import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Section from '@/components/common/Section';
import Card from '@/components/common/Card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: locale === 'ko' ? '장례 절차' : 'Quy trình tang lễ',
    description:
      locale === 'ko'
        ? '장례 절차 안내'
        : 'Hướng dẫn quy trình tang lễ',
  };
}

async function getFuneralItems(locale: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/funeral-items?locale=${locale}`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.error('[FUNERAL PROCEDURES] API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('[FUNERAL PROCEDURES] Fetch error:', error);
    return [];
  }
}

export default async function FuneralProceduresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== 'ko' && locale !== 'vi') {
    notFound();
  }

  const t = await getTranslations({ locale });
  const items = await getFuneralItems(locale);

  return (
    <Section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {locale === 'ko' ? '장례 절차' : 'Quy trình tang lễ'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'ko'
              ? '장례 절차에 대한 상세 안내입니다.'
              : 'Hướng dẫn chi tiết về quy trình tang lễ'}
          </p>
        </div>

        {/* Funeral Items Grid - 3 columns responsive */}
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {locale === 'ko'
                ? '표시할 장례 절차가 없습니다.'
                : 'Chưa có quy trình tang lễ nào được hiển thị.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any) => (
              <Card key={item.id} className="h-full flex flex-col p-6">
                {/* Step Number Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                    {locale === 'ko'
                      ? `단계 ${item.step_number}`
                      : `Bước ${item.step_number}`}
                  </span>
                </div>

                {/* Images */}
                {item.images && item.images.length > 0 && (
                  <div className="mb-4">
                    {item.images.length === 1 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {item.images.slice(0, 4).map((imageUrl: string, index: number) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`${item.title} - ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 flex-grow mb-4 line-clamp-4">
                  {item.description}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString(
                      locale === 'ko' ? 'ko-KR' : 'vi-VN'
                    )}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

