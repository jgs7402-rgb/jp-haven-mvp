import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Section from '@/components/common/Section';
import HeroPhoneCTA from '@/components/common/HeroPhoneCTA';
import Card from '@/components/common/Card';

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t('hero.title'),
    description: t('hero.desc'),
  };
}

async function getHeroImage() {
  try {
    const { readdir } = await import('fs/promises');
    const { join } = await import('path');
    const { existsSync } = await import('fs');
    
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      return null;
    }
    
    const files = await readdir(uploadDir).catch(() => []);
    const heroImage = files
      .filter((file) => file.startsWith('hero-'))
      .sort()
      .reverse()[0]; // 가장 최근 이미지

    return heroImage ? `/uploads/${heroImage}` : null;
  } catch {
    return null;
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations();
  const { locale } = await params;
  const heroImageUrl = await getHeroImage();

  // 메인 페이지에서도 장례 절차를 API 기반으로 불러오기 (현재 locale 사용)
  let steps: string[] = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
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
      console.warn('[PROCESS] Home fetch failed:', res.status, res.statusText);
    }
  } catch (error) {
    console.error('[PROCESS] Home fetch error:', error);
    // 에러 발생 시 빈 배열 사용 (기본값)
    steps = [];
  }

  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-balance">
            {t('hero.title')}
          </h1>
          <p className="mt-3 text-base md:text-lg opacity-90">
            {t('hero.desc')}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <HeroPhoneCTA />
            <Link
              href="/contact"
              className="px-5 py-3 rounded-2xl bg-white border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
            >
              {t('hero.form')}
            </Link>
          </div>
          <div className="mt-6 text-sm opacity-80">{t('contact.hours')}</div>
        </div>
        <div className="bg-white rounded-3xl shadow p-4 md:p-6">
          {heroImageUrl ? (
            <div className="aspect-video rounded-2xl overflow-hidden">
              <img
                src={heroImageUrl}
                alt={t('hero.title')}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-2xl bg-primary/5 grid place-content-center text-sm opacity-60">
              {t('hero.title')}
            </div>
          )}
        </div>
      </section>

      {/* Trust pills */}
      <Section>
        <div className="flex flex-wrap gap-3">
          {['exp', 'fast', 'clear'].map((key) => (
            <span
              key={key}
              className="px-4 py-2 rounded-full bg-white border border-primary/10 shadow text-sm"
            >
              {t(`trust.${key}`)}
            </span>
          ))}
        </div>
      </Section>

      {/* Process Preview */}
      <Section id="process">
        <h2 className="text-2xl font-semibold mb-6">{t('process.title')}</h2>
        <ol className="grid md:grid-cols-3 gap-4">
          {steps.map((step: string, i: number) => (
            <li key={i}>
              <Card className="p-4">
                <div className="text-3xl font-bold text-primary/60">{i + 1}</div>
                <div className="mt-2">{step}</div>
              </Card>
            </li>
          ))}
          {steps.length === 0 && (
            <li className="col-span-full text-center text-sm text-gray-500 py-8">
              표시할 장례 절차가 없습니다. 어드민에서 등록해주세요.
            </li>
          )}
        </ol>
        <div className="mt-6 text-center">
          <Link
            href="/process"
            className="inline-block px-6 py-3 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            {t('process.more')}
          </Link>
        </div>
      </Section>
    </>
  );
}

