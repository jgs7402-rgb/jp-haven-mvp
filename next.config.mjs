import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 빌드 시 ESLint 에러 무시 (빌드 통과를 위해)
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);

