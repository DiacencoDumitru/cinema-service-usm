import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMovieDisplayTitle } from '../hooks/useMovieDisplayTitle';
import { useLocaleStore } from '../stores/localeStore';
import type { Movie } from '../types';
import { movieSubtitle } from '../utils/movieTitle';
import { youtubeVideoIdFromUrl } from '../utils/youtube';

const TRAILER_MAX_PLAY_MS = 60_000;

type Props = {
  movies: Movie[];
};

type YTPlayer = {
  destroy: () => void;
  loadVideoById: (opts: { videoId: string }) => void;
  playVideo: () => void;
  pauseVideo: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let iframeApiPromise: Promise<void> | null = null;

function loadYoutubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (iframeApiPromise) return iframeApiPromise;
  iframeApiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
  return iframeApiPromise;
}

export function VideoStage({ movies }: Props) {
  const displayTitle = useMovieDisplayTitle();
  const locale = useLocaleStore((s) => s.locale);
  const withTrailers = useMemo(
    () => movies.filter((m) => youtubeVideoIdFromUrl(m.trailerUrl) != null),
    [movies],
  );

  const videoIds = useMemo(
    () => withTrailers.map((m) => youtubeVideoIdFromUrl(m.trailerUrl)!),
    [withTrailers],
  );

  const [index, setIndex] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const countRef = useRef(0);
  countRef.current = videoIds.length;

  const n = withTrailers.length;

  useEffect(() => {
    if (videoIds.length === 0) {
      setIndex(0);
      return;
    }
    setIndex((i) => Math.min(i, videoIds.length - 1));
  }, [videoIds.length]);

  const advance = useCallback(() => {
    if (n <= 1) return;
    setIndex((i) => (i + 1) % n);
  }, [n]);

  const goPrev = useCallback(() => {
    if (n <= 0) return;
    setIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const goTo = useCallback(
    (i: number) => {
      if (n <= 0) return;
      setIndex(((i % n) + n) % n);
    },
    [n],
  );

  const videoIdsKey = videoIds.join(',');

  useEffect(() => {
    if (videoIds.length === 0 || !containerRef.current) return;

    let cancelled = false;
    setPlayerReady(false);

    void loadYoutubeIframeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT?.Player) return;

      playerRef.current?.destroy();
      playerRef.current = null;

      const startId = videoIds[0];
      if (!startId) return;

      const player = new window.YT.Player(containerRef.current, {
        videoId: startId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (!cancelled) {
              setPlayerReady(true);
              player.playVideo();
            }
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === 0) {
              setIndex((i) => {
                const c = countRef.current;
                if (c <= 0) return 0;
                return (i + 1) % c;
              });
            }
          },
        },
      });
      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      setPlayerReady(false);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoIdsKey]);

  useEffect(() => {
    const p = playerRef.current;
    if (!playerReady || !p || videoIds.length === 0) return;
    const id = videoIds[index];
    if (!id) return;
    p.loadVideoById({ videoId: id });
    p.playVideo();
  }, [index, videoIds, playerReady]);

  useEffect(() => {
    if (!playerReady || n <= 0) return;
    const t = window.setTimeout(() => {
      setIndex((i) => {
        const c = countRef.current;
        if (c <= 0) return 0;
        return (i + 1) % c;
      });
    }, TRAILER_MAX_PLAY_MS);
    return () => window.clearTimeout(t);
  }, [index, playerReady, n, videoIdsKey]);

  if (movies.length === 0) {
    return null;
  }

  if (n === 0) {
    return (
      <section className="w-full" aria-label="Trailere">
        <p className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-8 text-center text-slate-500">
          Nu există trailere disponibile pentru filmele din derulare.
        </p>
      </section>
    );
  }

  const current = withTrailers[index];
  const showArrows = n > 1;

  return (
    <section className="w-full" aria-label="Trailere">
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-black shadow-lg">
        {showArrows && (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-purple-500/50 bg-purple-900/85 px-3 py-2.5 text-xl leading-none text-white shadow-lg transition hover:bg-purple-800"
              onClick={goPrev}
              aria-label="Trailer anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-purple-500/50 bg-purple-900/85 px-3 py-2.5 text-xl leading-none text-white shadow-lg transition hover:bg-purple-800"
              onClick={advance}
              aria-label="Trailer următor"
            >
              ›
            </button>
          </>
        )}

        <div className="relative aspect-video w-full">
          <div
            ref={containerRef}
            className="absolute inset-0 h-full w-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
            title={`Trailer: ${displayTitle(current)}`}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4 pt-16"
            aria-hidden
          >
            <p className="text-lg font-bold tracking-wide text-white drop-shadow-md sm:text-xl">{displayTitle(current)}</p>
            {movieSubtitle(current, locale) ? (
              <p className="mt-1 text-sm text-slate-300">{movieSubtitle(current, locale)}</p>
            ) : null}
          </div>
        </div>
      </div>

      {n > 1 && (
        <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Select trailer">
          {withTrailers.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`h-2.5 w-2.5 rounded-full transition ${i === index ? 'bg-purple-500' : 'bg-slate-600 hover:bg-slate-500'}`}
              onClick={() => goTo(i)}
              aria-label={`Trailer ${displayTitle(m)}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
