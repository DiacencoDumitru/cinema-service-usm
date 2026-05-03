import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CursorPage, Movie } from '../types';
import { MovieCarousel } from '../components/MovieCarousel';
import { VideoStage } from '../components/VideoStage';
import { sortNowShowingMovies } from '../utils/nowShowingOrder';

async function fetchMovies(status: string) {
  const { data } = await api.get<CursorPage<Movie>>(`/api/movies`, { params: { status, limit: 12 } });
  return data;
}

export function Home() {
  const now = useQuery({ queryKey: ['movies', 'NOW_SHOWING'], queryFn: () => fetchMovies('NOW_SHOWING') });
  const soon = useQuery({ queryKey: ['movies', 'COMING_SOON'], queryFn: () => fetchMovies('COMING_SOON') });
  const nowOrdered = sortNowShowingMovies(now.data?.items ?? []);

  return (
    <div className="space-y-12">
      <VideoStage movies={nowOrdered} />

      <MovieCarousel title="ÎN DERULARE" movies={nowOrdered} />

      <MovieCarousel title="ÎN CURÂND" movies={soon.data?.items ?? []} />
    </div>
  );
}
