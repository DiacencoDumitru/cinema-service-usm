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

function FetchBanner({ tone, children }: { tone: 'load' | 'err'; children: React.ReactNode }) {
  const cls =
    tone === 'load'
      ? 'border-slate-600 bg-slate-900/70 text-slate-300'
      : 'border-amber-700/60 bg-amber-950/35 text-amber-100';
  return (
    <p className={`rounded-xl border px-4 py-3 text-sm ${cls}`} role="status">
      {children}
    </p>
  );
}

export function Home() {
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
      {now.isPending && <FetchBanner tone="load">Se încarcă filmele din derulare…</FetchBanner>}
      {now.isError && (
        <FetchBanner tone="err">
          Nu s-au putut încărca filmele din derulare. Verifică că backend-ul răspunde la /api/movies, că domeniul
          aplicației este inclus în CORS (CORS_ORIGIN_* pe server) și, dacă API-ul e pe alt host, setează
          VITE_API_URL la buildul frontend-ului.
        </FetchBanner>
      )}

      {nowReady && <VideoStage movies={nowOrdered} />}

      {nowReady && <MovieCarousel title="ÎN DERULARE" movies={nowOrdered} />}

      {soon.isPending && <FetchBanner tone="load">Se încarcă filmele din curând…</FetchBanner>}
      {soon.isError && (
        <FetchBanner tone="err">
          Nu s-au putut încărca filmele din curând. Aceleași verificări ca pentru secțiunea din derulare.
        </FetchBanner>
      )}

      {soonReady && <MovieCarousel title="ÎN CURÂND" movies={soon.data?.items ?? []} />}
    </div>
  );
}
