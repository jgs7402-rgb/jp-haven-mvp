import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { generateMetadata } from './metadata';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import '../globals.css';

export { generateMetadata };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'JP Haven',
            description: '장서·장지 안내 서비스',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
            telephone: '+82-00-0000-0000',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'KR',
            },
            sameAs: [],
          }),
        }}
      />
      <NextIntlClientProvider messages={messages}>
        <Header />
        <main>{children}</main>
        <Footer />
      </NextIntlClientProvider>
    </>
  );
}
