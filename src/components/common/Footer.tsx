'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import PhoneCTA from './PhoneCTA';

const DEFAULT_PHONE_NUMBER = '+82-00-0000-0000';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const [phone, setPhone] = useState(DEFAULT_PHONE_NUMBER);
  const [hours, setHours] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('JP Haven');
  const [copyright, setCopyright] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 핫라인 데이터
        const hotlineRes = await fetch('/api/hotline');
        if (hotlineRes.ok) {
          const hotlineData = await hotlineRes.json();
          if (hotlineData.phone) {
            setPhone(hotlineData.phone);
          }
          if (hotlineData.hoursKo || hotlineData.hoursVi) {
            setHours(hotlineData.hoursKo || hotlineData.hoursVi);
          }
        }

        // 푸터 데이터
        const footerRes = await fetch('/api/footer');
        if (footerRes.ok) {
          const footerData = await footerRes.json();
          if (footerData.companyName) {
            setCompanyName(footerData.companyName);
          }
          // 현재 locale에 맞는 저작권 텍스트 설정
          if (locale === 'vi') {
            setCopyright(footerData.copyrightVi || 'Bảo lưu mọi quyền');
          } else {
            setCopyright(footerData.copyrightKo || '모든 권리 보유');
          }
        }
      } catch (error) {
        console.error('[FOOTER] Fetch error:', error);
      }
    };

    fetchData();
  }, [locale]);

  return (
    <footer className="border-t border-primary/10 bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-3">{companyName}</h3>
            <p className="text-sm opacity-80 mb-4">{t('contact.hours')}</p>
            {/* 상담시간 텍스트와 버튼이 겹치지 않도록 여백을 더 크게 설정 */}
            <PhoneCTA phone={phone} className="mt-4" />
          </div>
          <div>
            <h3 className="font-semibold mb-3">{t('nav.cemeteries')}</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/cemeteries" className="hover:underline opacity-80">
                {t('nav.cemeteries')}
              </Link>
              <Link href="/process" className="hover:underline opacity-80">
                {t('nav.process')}
              </Link>
              <Link href="/contact" className="hover:underline opacity-80">
                {t('nav.contact')}
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="font-semibold mb-3">{t('contact.hotline')}</h3>
            <a
              href={`tel:${phone.replace(/-/g, '').replace(/\+/g, '')}`}
              className="text-lg font-semibold block mb-2"
            >
              {phone}
            </a>
            <p className="text-sm opacity-80">{t('contact.hours')}</p>
          </div>
        </div>
        <div className="pt-6 border-t border-primary/10 text-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="opacity-80">
            © {new Date().getFullYear()} {companyName}. {copyright || t('footer.rights')}
          </div>
        </div>
      </div>
    </footer>
  );
}

