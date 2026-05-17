import type { AppLocale } from '../i18n/types';
import type { Movie } from '../types';

export function movieSynopsis(movie: Pick<Movie, 'synopsis' | 'synopsisRu' | 'synopsisEn'>, locale: AppLocale): string | null {
  if (locale === 'ru' && movie.synopsisRu) return movie.synopsisRu;
  if (locale === 'en' && movie.synopsisEn) return movie.synopsisEn;
  return movie.synopsis;
}
