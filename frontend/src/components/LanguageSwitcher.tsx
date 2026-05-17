import { useTranslation } from 'react-i18next';
import { APP_LOCALES, type AppLocale } from '../i18n/types';
import { useLocaleStore } from '../stores/localeStore';

export function LanguageSwitcher() {
  const { t } = useTranslation('common');
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-slate-700 bg-slate-900/80 p-0.5"
      role="group"
      aria-label={t('languageSwitcher.label')}
    >
      {APP_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={`min-w-[2.25rem] rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wide transition ${
            locale === code
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
          aria-current={locale === code ? 'true' : undefined}
          onClick={() => setLocale(code as AppLocale)}
        >
          {t(`languageSwitcher.${code}`)}
        </button>
      ))}
    </div>
  );
}
