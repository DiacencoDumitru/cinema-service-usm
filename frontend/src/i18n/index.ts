import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { isAppLocale } from './types';

import roCommon from './locales/ro/common.json';
import roNav from './locales/ro/nav.json';
import roErrors from './locales/ro/errors.json';
import roValidation from './locales/ro/validation.json';
import roAuth from './locales/ro/auth.json';
import roBooking from './locales/ro/booking.json';
import roAdmin from './locales/ro/admin.json';
import roStatic from './locales/ro/static.json';
import roHome from './locales/ro/home.json';
import roSchedule from './locales/ro/schedule.json';
import roPricing from './locales/ro/pricing.json';
import roMovie from './locales/ro/movie.json';

import ruCommon from './locales/ru/common.json';
import ruNav from './locales/ru/nav.json';
import ruErrors from './locales/ru/errors.json';
import ruValidation from './locales/ru/validation.json';
import ruAuth from './locales/ru/auth.json';
import ruBooking from './locales/ru/booking.json';
import ruAdmin from './locales/ru/admin.json';
import ruStatic from './locales/ru/static.json';
import ruHome from './locales/ru/home.json';
import ruSchedule from './locales/ru/schedule.json';
import ruPricing from './locales/ru/pricing.json';
import ruMovie from './locales/ru/movie.json';

import enCommon from './locales/en/common.json';
import enNav from './locales/en/nav.json';
import enErrors from './locales/en/errors.json';
import enValidation from './locales/en/validation.json';
import enAuth from './locales/en/auth.json';
import enBooking from './locales/en/booking.json';
import enAdmin from './locales/en/admin.json';
import enStatic from './locales/en/static.json';
import enHome from './locales/en/home.json';
import enSchedule from './locales/en/schedule.json';
import enPricing from './locales/en/pricing.json';
import enMovie from './locales/en/movie.json';

const STORAGE_KEY = 'aurora-locale';

function readStoredLocale(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 'ro';
    const parsed = JSON.parse(raw) as { state?: { locale?: string } };
    const locale = parsed?.state?.locale;
    return locale && isAppLocale(locale) ? locale : 'ro';
  } catch {
    return 'ro';
  }
}

const initialLng = readStoredLocale();
document.documentElement.lang = initialLng;

void i18n.use(initReactI18next).init({
  resources: {
    ro: {
      common: roCommon,
      nav: roNav,
      errors: roErrors,
      validation: roValidation,
      auth: roAuth,
      booking: roBooking,
      admin: roAdmin,
      static: roStatic,
      home: roHome,
      schedule: roSchedule,
      pricing: roPricing,
      movie: roMovie,
    },
    ru: {
      common: ruCommon,
      nav: ruNav,
      errors: ruErrors,
      validation: ruValidation,
      auth: ruAuth,
      booking: ruBooking,
      admin: ruAdmin,
      static: ruStatic,
      home: ruHome,
      schedule: ruSchedule,
      pricing: ruPricing,
      movie: ruMovie,
    },
    en: {
      common: enCommon,
      nav: enNav,
      errors: enErrors,
      validation: enValidation,
      auth: enAuth,
      booking: enBooking,
      admin: enAdmin,
      static: enStatic,
      home: enHome,
      schedule: enSchedule,
      pricing: enPricing,
      movie: enMovie,
    },
  },
  lng: initialLng,
  fallbackLng: 'ro',
  supportedLngs: ['ro', 'ru', 'en'],
  defaultNS: 'common',
  ns: [
    'common',
    'nav',
    'errors',
    'validation',
    'auth',
    'booking',
    'admin',
    'static',
    'home',
    'schedule',
    'pricing',
    'movie',
  ],
  interpolation: { escapeValue: false },
});

export default i18n;
