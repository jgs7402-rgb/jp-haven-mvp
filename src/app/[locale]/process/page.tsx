import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Section from '@/components/common/Section';
import Card from '@/components/common/Card';
import {
  generateProcessPageMetadata,
  getProcessPageTitle,
} from '@/lib/seo';
import ProcessStepsClient from './ProcessStepsClient';

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

  const steps = await getProcessSteps(locale);
  const pageTitle = getProcessPageTitle(locale as 'ko' | 'vi');

  return (
    <Section>
      <ProcessStepsClient
        locale={locale as 'ko' | 'vi'}
        steps={steps}
        pageTitle={pageTitle}
      />
    </Section>
  );
}
