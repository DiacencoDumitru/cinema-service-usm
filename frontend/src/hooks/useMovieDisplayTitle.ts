import { useCallback } from 'react';
import { useLocaleStore } from '../stores/localeStore';
import { movieDisplayTitle, type MovieTitleFields } from '../utils/movieTitle';

export function useMovieDisplayTitle() {
  const locale = useLocaleStore((s) => s.locale);
  return useCallback((fields: MovieTitleFields) => movieDisplayTitle(fields, locale), [locale]);
}
