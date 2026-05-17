import type { AppLocale } from '../i18n/types';

const INTL_LOCALE: Record<AppLocale, string> = {
  ro: 'ro-RO',
  ru: 'ru-RU',
  en: 'en-GB',
};

export function intlLocale(locale: AppLocale): string {
  return INTL_LOCALE[locale];
}

export function formatDateTime(iso: string, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(intlLocale(locale), options);
}

export function formatDate(iso: string, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(intlLocale(locale), options);
}

export function formatTime(iso: string, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(intlLocale(locale), options);
}
