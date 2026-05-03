import { useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CursorPage, Movie } from '../types';
import { MovieCarousel } from '../components/MovieCarousel';
import { VideoStage } from '../components/VideoStage';
import { sortNowShowingMovies } from '../utils/nowShowingOrder';

async function fetchMovies(status: string) {
  // #region agent log
  fetch('http://127.0.0.1:7557/ingest/cd9f4e16-5bb6-4cfe-a86a-9fd6a451d7bc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '087bca' },
    body: JSON.stringify({
      sessionId: '087bca',
      hypothesisId: 'H1-H3',
      location: 'Home.tsx:fetchMovies:start',
      message: 'movies fetch start',
      data: {
        statusParam: status,
        viteApiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? '',
        pageOrigin: typeof window !== 'undefined' ? window.location.origin : '',
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  try {
    const { data } = await api.get<CursorPage<Movie>>(`/api/movies`, { params: { status, limit: 12 } });
    // #region agent log
    fetch('http://127.0.0.1:7557/ingest/cd9f4e16-5bb6-4cfe-a86a-9fd6a451d7bc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '087bca' },
      body: JSON.stringify({
        sessionId: '087bca',
        hypothesisId: 'H2-H5',
        location: 'Home.tsx:fetchMovies:ok',
        message: 'movies fetch ok',
        data: {
          statusParam: status,
          itemCount: Array.isArray(data?.items) ? data.items.length : -1,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return data;
  } catch (e: unknown) {
    const err = e as { message?: string; code?: string; response?: { status?: number } };
    // #region agent log
    fetch('http://127.0.0.1:7557/ingest/cd9f4e16-5bb6-4cfe-a86a-9fd6a451d7bc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '087bca' },
      body: JSON.stringify({
        sessionId: '087bca',
        hypothesisId: 'H2-H5',
        location: 'Home.tsx:fetchMovies:err',
        message: 'movies fetch error',
        data: {
          statusParam: status,
          errMessage: err?.message ?? String(e),
          errCode: err?.code,
          httpStatus: err?.response?.status,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw e;
  }
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

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7557/ingest/cd9f4e16-5bb6-4cfe-a86a-9fd6a451d7bc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '087bca' },
      body: JSON.stringify({
        sessionId: '087bca',
        hypothesisId: 'H4',
        location: 'Home.tsx:useEffect:rq-state',
        message: 'react-query snapshot',
        data: {
          nowStatus: now.status,
          nowFetchStatus: now.fetchStatus,
          soonStatus: soon.status,
          soonFetchStatus: soon.fetchStatus,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [now.status, now.fetchStatus, soon.status, soon.fetchStatus]);

  return (
    <div className="space-y-12">
      {now.isPending && <FetchBanner tone="load">Se încarcă filmele din derulare…</FetchBanner>}
      {now.isError && (
        <FetchBanner tone="err">
          Nu s-au putut încărca filmele din derulare. Verifică că backend-ul răspunde la /api/movies, că domeniul
          aplicației este inclus în CORS (CORS_ORIGIN_* pe server) și, dacă API-ul e pe alt host, setează
          VITE_API_URL la buildul frontend-ului.
          {axios.isAxiosError(now.error) && now.error.response?.status === 502 && (
            <span className="mt-2 block border-t border-amber-600/40 pt-2 text-xs">
              Răspuns 502 (Bad Gateway): de obicei nginx nu poate contacta backend-ul (încă pornește sau a căzut).
              Cu Docker Compose: reconstruiește imaginile, apoi `docker compose up` — frontend-ul așteaptă acum
              backend-ul sănătos înainte de a fi marcat „ready”.
            </span>
          )}
        </FetchBanner>
      )}

      {nowReady && <VideoStage movies={nowOrdered} />}

      {nowReady && <MovieCarousel title="ÎN DERULARE" movies={nowOrdered} />}

      {soon.isPending && <FetchBanner tone="load">Se încarcă filmele din curând…</FetchBanner>}
      {soon.isError && (
        <FetchBanner tone="err">
          Nu s-au putut încărca filmele din curând. Aceleași verificări ca pentru secțiunea din derulare.
          {axios.isAxiosError(soon.error) && soon.error.response?.status === 502 && (
            <span className="mt-2 block border-t border-amber-600/40 pt-2 text-xs">
              Răspuns 502: vezi mesajul de mai sus pentru derulare (același gateway/backend).
            </span>
          )}
        </FetchBanner>
      )}

      {soonReady && <MovieCarousel title="ÎN CURÂND" movies={soon.data?.items ?? []} />}
    </div>
  );
}
