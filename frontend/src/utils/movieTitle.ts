import type { AppLocale } from '../i18n/types';

export interface MovieTitleFields {
  title?: string;
  originalTitle?: string | null;
  titleRu?: string | null;
  movieTitle?: string;
}

export function movieDisplayTitle(fields: MovieTitleFields, locale: AppLocale): string {
  const ro = fields.movieTitle ?? fields.title ?? '';
  const en = fields.originalTitle?.trim();
  const ru = fields.titleRu?.trim();

  switch (locale) {
    case 'en':
      return en || ro;
    case 'ru':
      return ru || en || ro;
    default:
      return ro;
  }
}

export function movieSubtitle(fields: MovieTitleFields, locale: AppLocale): string | null {
  const main = movieDisplayTitle(fields, locale);
  const ro = fields.movieTitle ?? fields.title ?? '';
  const en = fields.originalTitle?.trim();
  const ru = fields.titleRu?.trim();

  if (locale === 'ro') {
    return en && en !== main ? en : null;
  }
  if (locale === 'en') {
    return ro && ro !== main ? ro : null;
  }
  if (ru && ru !== main) return null;
  if (en && en !== main) return en;
  if (ro && ro !== main) return ro;
  return null;
}
