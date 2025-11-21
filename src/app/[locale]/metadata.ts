import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return {
    title: {
      default: t('hero.title'),
      template: `%s | JP Haven`,
    },
    description: t('hero.desc'),
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: 'website',
      locale: locale,
      url: `${baseUrl}/${locale}`,
      title: t('hero.title'),
      description: t('hero.desc'),
      siteName: 'JP Haven',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('hero.title'),
      description: t('hero.desc'),
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        ko: `${baseUrl}/ko`,
        vi: `${baseUrl}/vi`,
      },
    },
  };
}

