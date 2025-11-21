import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ko', 'vi'],
  defaultLocale: 'ko'
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

