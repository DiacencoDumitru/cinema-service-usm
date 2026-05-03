import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Movie } from '../types';
import { youtubeVideoIdFromUrl } from '../utils/youtube';

const TRAILER_ROTATE_MS = 28_000;

function embedSrc(videoId: string) {
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?mute=1&autoplay=1&controls=1&rel=0&playsinline=1`;
}

type Props = {
  movies: Movie[];
};

export function VideoStage({ movies }: Props) {
  const withTrailers = useMemo(
    () => movies.filter((m) => youtubeVideoIdFromUrl(m.trailerUrl) != null),
    [movies],
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const n = withTrailers.length;

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, n - 1)));
  }, [n]);

  const advance = useCallback(() => {
    if (n <= 1) return;
    setIndex((i) => (i + 1) % n);
  }, [n]);

  const goPrev = useCallback(() => {
    if (n <= 0) return;
    setIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const goTo = useCallback((i: number) => {
    if (n <= 0) return;
    setIndex(((i % n) + n) % n);
  }, [n]);

  useEffect(() => {
    if (n <= 1 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, TRAILER_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [n, paused, index]);

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
  const videoId = youtubeVideoIdFromUrl(current.trailerUrl)!;
  const src = embedSrc(videoId);
  const showArrows = n > 1;

  return (
    <section className="w-full" aria-label="Trailere">
      <div
        className="relative overflow-hidden rounded-xl border border-slate-800 bg-black shadow-lg"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
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
          <iframe
            key={`${current.id}-${index}`}
            title={`Trailer: ${current.title}`}
            src={src}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4 pt-16"
            aria-hidden
          >
            <p className="text-lg font-bold tracking-wide text-white drop-shadow-md sm:text-xl">{current.title}</p>
            {current.originalTitle && current.originalTitle !== current.title && (
              <p className="mt-1 text-sm text-slate-300">{current.originalTitle}</p>
            )}
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
              aria-label={`Trailer ${m.title}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
