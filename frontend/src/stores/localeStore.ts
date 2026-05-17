import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';
import { type AppLocale, isAppLocale } from '../i18n/types';

interface LocaleState {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}

function applyDocumentLocale(locale: AppLocale) {
  document.documentElement.lang = locale;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'ro',
      setLocale: (locale) => {
        applyDocumentLocale(locale);
        void i18n.changeLanguage(locale);
        set({ locale });
      },
    }),
    {
      name: 'aurora-locale',
      onRehydrateStorage: () => (state) => {
        const locale = state?.locale && isAppLocale(state.locale) ? state.locale : 'ro';
        applyDocumentLocale(locale);
        void i18n.changeLanguage(locale);
      },
    },
  ),
);
