import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Section from '@/components/common/Section';
import Card from '@/components/common/Card';
import {
  generateProcessPageMetadata,
  getProcessPageTitle,
} from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (locale !== 'ko' && locale !== 'vi') {
    return {};
  }

  return generateProcessPageMetadata({
    locale: locale as 'ko' | 'vi',
  });
}

async function getProcessSteps(locale: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/process?locale=${locale}`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.error('[PROCESS] API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.steps || [];
  } catch (error) {
    console.error('[PROCESS] Fetch error:', error);
    return [];
  }
}

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== 'ko' && locale !== 'vi') {
    notFound();
  }

  const t = await getTranslations({ locale });
  const steps = await getProcessSteps(locale);
  const pageTitle = getProcessPageTitle(locale as 'ko' | 'vi');

  return (
    <Section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {pageTitle}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'ko'
              ? 'JP Haven Memorial의 장례 절차 안내 및 절차별 설명을 확인하세요.'
              : 'Hướng dẫn từng bước trong quy trình tang lễ tại JP Haven Memorial'}
          </p>
        </div>

        {/* Process Steps Grid - 3 columns responsive */}
        {steps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {locale === 'ko'
                ? '표시할 장례 절차가 없습니다.'
                : 'Chưa có quy trình tang lễ nào được hiển thị.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step: any, index: number) => (
              <Card
                key={step.id || index}
                className="h-full flex flex-col p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Step Number Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                    {locale === 'ko'
                      ? `단계 ${step.step_order}`
                      : `Bước ${step.step_order}`}
                  </span>
                </div>

                {/* Images */}
                {step.images && step.images.length > 0 && (
                  <div className="mb-4">
                    {step.images.length === 1 ? (
                      <img
                        src={step.images[0]}
                        alt={step.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {step.images.slice(0, 4).map((imageUrl: string, imgIndex: number) => (
                          <img
                            key={imgIndex}
                            src={imageUrl}
                            alt={`${step.title} - ${imgIndex + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 flex-grow mb-4 line-clamp-4">
                  {step.description}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400">
                    {new Date().toLocaleDateString(
                      locale === 'ko' ? 'ko-KR' : 'vi-VN'
                    )}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Fade-in animation CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Section>
  );
}
