import { useLocaleStore } from '../stores/localeStore';
import { formatDate, formatDateTime, formatTime, intlLocale } from '../utils/format';

export function useAppLocale() {
  const locale = useLocaleStore((s) => s.locale);
  return {
    locale,
    intlLocale: intlLocale(locale),
    formatDateTime: (iso: string, options?: Intl.DateTimeFormatOptions) => formatDateTime(iso, locale, options),
    formatDate: (iso: string, options?: Intl.DateTimeFormatOptions) => formatDate(iso, locale, options),
    formatTime: (iso: string, options?: Intl.DateTimeFormatOptions) => formatTime(iso, locale, options),
  };
}
