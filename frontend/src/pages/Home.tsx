import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { FetchBanner } from '../components/FetchBanner';
import type { CursorPage, Movie } from '../types';
import { MovieCarousel } from '../components/MovieCarousel';
import { VideoStage } from '../components/VideoStage';
import { sortNowShowingMovies } from '../utils/nowShowingOrder';

async function fetchMovies(status: string) {
  const { data } = await api.get<CursorPage<Movie>>(`/api/movies`, { params: { status, limit: 12 } });
  return data;
}

export function Home() {
  const { t } = useTranslation('home');
  const now = useQuery({
    queryKey: ['movies', 'NOW_SHOWING'],
    queryFn: () => fetchMovies('NOW_SHOWING'),
    retry: 1,
    staleTime: 30_000,
  });
  const soon = useQuery({
    queryKey: ['movies', 'COMING_SOON'],
    queryFn: () => fetchMovies('COMING_SOON'),
    retry: 1,
    staleTime: 30_000,
  });

  const nowOrdered = sortNowShowingMovies(now.data?.items ?? []);
  const nowReady = !now.isPending && !now.isError;
  const soonReady = !soon.isPending && !soon.isError;

  return (
    <div className="space-y-12">
      {now.isPending && <FetchBanner tone="load">{t('nowShowingLoad')}</FetchBanner>}
      {now.isError && (
        <FetchBanner tone="err">
          {t('nowShowingError')}
          {axios.isAxiosError(now.error) && now.error.response?.status === 502 && (
            <span className="mt-2 block border-t border-amber-600/40 pt-2 text-xs">{t('nowShowing502')}</span>
          )}
        </FetchBanner>
      )}

      {nowReady && <VideoStage movies={nowOrdered} />}

      {nowReady && <MovieCarousel title={t('carouselNowShowing')} movies={nowOrdered} />}

      {soon.isPending && <FetchBanner tone="load">{t('comingSoonLoad')}</FetchBanner>}
      {soon.isError && (
        <FetchBanner tone="err">
          {t('comingSoonError')}
          {axios.isAxiosError(soon.error) && soon.error.response?.status === 502 && (
            <span className="mt-2 block border-t border-amber-600/40 pt-2 text-xs">{t('comingSoon502')}</span>
          )}
        </FetchBanner>
      )}

      {soonReady && <MovieCarousel title={t('carouselComingSoon')} movies={soon.data?.items ?? []} />}
    </div>
  );
}
