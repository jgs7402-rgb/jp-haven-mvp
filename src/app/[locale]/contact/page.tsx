'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Section from '@/components/common/Section';
import Card from '@/components/common/Card';

const DEFAULT_PHONE_NUMBER = '+82-00-0000-0000';

export default function ContactPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [hotlinePhone, setHotlinePhone] = useState(DEFAULT_PHONE_NUMBER);
  const [hotlineHours, setHotlineHours] = useState<string | null>(null);
  const [contactImageUrl, setContactImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    time: '',
    note: '',
    honeypot: '', // 스팸 방지
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // 핫라인 정보 로딩 (어드민에서 관리하는 값 사용)
  useEffect(() => {
    const fetchHotline = async () => {
      try {
        const res = await fetch('/api/hotline');
        if (!res.ok) return;
        const data = await res.json();
        if (data.phone) {
          setHotlinePhone(data.phone);
        }
        if (locale === 'ko' && data.hoursKo) {
          setHotlineHours(data.hoursKo);
        } else if (locale === 'vi' && data.hoursVi) {
          setHotlineHours(data.hoursVi);
        }
      } catch (err) {
        console.error('[HOTLINE] Contact page fetch error:', err);
      }
    };

    fetchHotline();
  }, [locale]);

  // 상담문의 페이지 이미지 로딩 (어드민에서 관리하는 값 사용)
  useEffect(() => {
    const fetchContactImage = async () => {
      try {
        const res = await fetch('/api/images/contact');
        if (!res.ok) return;
        const data = await res.json();
        if (data.url) {
          setContactImageUrl(data.url);
        }
      } catch (err) {
        console.error('[CONTACT IMAGE] Fetch error:', err);
      }
    };

    fetchContactImage();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Honeypot 체크
    if (formData.honeypot) {
      return; // 봇이면 무시
    }

    // 기본 검증: 이름 / 연락처 필수
    if (!formData.name || !formData.phone) {
      let message = '';
      if (!formData.name && !formData.phone) {
        message = t('contact.missingRequired');
      } else if (!formData.name) {
        message = t('contact.missingName');
      } else {
        message = t('contact.missingPhone');
      }
      setError(message);
      if (typeof window !== 'undefined') {
        alert(message);
      }
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          time: formData.time,
          note: formData.note,
        }),
      });

      if (!response.ok) {
        throw new Error('제출 실패');
      }

      setIsSubmitted(true);
      setFormData({ name: '', phone: '', time: '', note: '', honeypot: '' });
    } catch (err) {
      setError(t('contact.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section>
      <h1 className="text-2xl md:text-3xl font-semibold mb-8">
        {t('contact.title')}
      </h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('contact.title')}</h2>
          {isSubmitted ? (
            <div className="p-4 rounded-xl bg-green-50 text-green-700">
              {t('contact.ok')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              {/* Honeypot */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) =>
                  setFormData({ ...formData, honeypot: e.target.value })
                }
                className="sr-only"
                tabIndex={-1}
                autoComplete="off"
              />

              <input
                type="text"
                placeholder={t('contact.name')}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-3 py-2 rounded-xl bg-white border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('contact.name')}
              />
              <input
                type="tel"
                placeholder={t('contact.phone')}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="px-3 py-2 rounded-xl bg-white border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('contact.phone')}
              />
              <input
                type="text"
                placeholder={t('contact.time')}
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="px-3 py-2 rounded-xl bg-white border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('contact.time')}
              />
              <textarea
                placeholder={t('contact.note')}
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                rows={4}
                className="px-3 py-2 rounded-xl bg-white border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('contact.note')}
              />
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-3 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? locale === 'ko'
                    ? '전송 중...'
                    : 'Đang gửi...'
                  : t('contact.submit')}
              </button>
            </form>
          )}
        </Card>
        <Card className="p-6">
          <div className="text-sm opacity-80 mb-1">{t('contact.hotline')}</div>
          <a
            href={`tel:${hotlinePhone.replace(/-/g, '').replace(/\+/g, '')}`}
            className="text-2xl font-bold block mb-2 hover:underline"
          >
            {hotlinePhone}
          </a>
          <div className="mt-2 text-sm opacity-80">
            {hotlineHours || t('contact.hours')}
          </div>
          {contactImageUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden">
              <img
                src={contactImageUrl}
                alt="상담문의"
                className="w-full h-auto object-cover rounded-2xl"
              />
            </div>
          )}
        </Card>
      </div>
    </Section>
  );
}

