import { getTranslations } from 'next-intl/server';
import Section from '@/components/common/Section';
import Card from '@/components/common/Card';

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t('process.title'),
    description: t('process.title'),
  };
}

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations();
  const { locale } = await params;

  let steps: string[] = [];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(
      `${baseUrl}/api/process?locale=${locale}`,
      { 
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    );
    if (res.ok) {
      const data = await res.json();
      steps = Array.isArray(data.steps) ? data.steps : [];
    } else {
      console.warn('[PROCESS] Fetch failed:', res.status, res.statusText);
    }
  } catch (error) {
    console.error('[PROCESS] Fetch error:', error);
    // 에러 발생 시 빈 배열 사용 (기본값)
    steps = [];
  }

  return (
    <Section>
      <h1 className="text-2xl md:text-3xl font-semibold mb-8">
        {t('process.title')}
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step: string, i: number) => (
          <Card key={i} className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white grid place-content-center text-xl font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="opacity-80">{step}</p>
              </div>
            </div>
          </Card>
        ))}
        {steps.length === 0 && (
          <div className="col-span-full text-center text-sm text-gray-500 py-8">
            표시할 장례 절차가 없습니다. 어드민에서 등록해주세요.
          </div>
        )}
      </div>
    </Section>
  );
}

