import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CursorPage, Movie } from '../types';
import { MovieCarousel } from '../components/MovieCarousel';
import { VideoStage } from '../components/VideoStage';

async function fetchMovies(status: string) {
  const { data } = await api.get<CursorPage<Movie>>(`/api/movies`, { params: { status, limit: 12 } });
  return data;
}

export function Home() {
  const now = useQuery({ queryKey: ['movies', 'NOW_SHOWING'], queryFn: () => fetchMovies('NOW_SHOWING') });
  const soon = useQuery({ queryKey: ['movies', 'COMING_SOON'], queryFn: () => fetchMovies('COMING_SOON') });

  return (
    <div className="space-y-12">
      <VideoStage movies={now.data?.items ?? []} />

      <MovieCarousel title="ÎN DERULARE" movies={now.data?.items ?? []} />

      <MovieCarousel title="ÎN CURÂND" movies={soon.data?.items ?? []} />
    </div>
  );
}
