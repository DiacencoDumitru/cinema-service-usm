import { useCallback, useEffect, useRef, useState } from 'react';
import type { Movie } from '../types';

function videoUrlFor(m: Movie): string {
  return (m.posterUrl ?? '').replace('/posters/', '/videos/').replace('.jpg', '.mp4');
}

function findNextPlayableIndex(
  currentIdx: number,
  movies: Movie[],
  failed: ReadonlySet<number>,
): number | null {
  const n = movies.length;
  if (n === 0) return null;
  for (let step = 1; step <= n; step++) {
    const i = (currentIdx + step) % n;
    if (!failed.has(movies[i].id)) return i;
  }
  return null;
}

type Props = {
  movies: Movie[];
};

export function VideoStage({ movies }: Props) {
  const [index, setIndex] = useState(0);
  const [failedIds, setFailedIds] = useState<Set<number>>(() => new Set());
  const failedRef = useRef(failedIds);

  useEffect(() => {
    failedRef.current = failedIds;
  }, [failedIds]);

  const movieIdsKey = movies.map((m) => m.id).join(',');

  useEffect(() => {
    setFailedIds(new Set());
    setIndex(0);
  }, [movieIdsKey]);

  const advance = useCallback(() => {
    if (movies.length === 0) return;
    setIndex((currentIdx) => {
      const nextIdx = findNextPlayableIndex(currentIdx, movies, failedRef.current);
      return nextIdx ?? currentIdx;
    });
  }, [movies]);

  const handleError = useCallback(() => {
    if (movies.length === 0) return;
    const idxAtError = index;
    const cur = movies[idxAtError];
    if (!cur) return;

    setFailedIds((prev) => {
      if (prev.has(cur.id)) return prev;
      const next = new Set(prev);
      next.add(cur.id);
      const nextIdx = findNextPlayableIndex(idxAtError, movies, next);
      if (nextIdx !== null) {
        setIndex(nextIdx);
      }
      return next;
    });
  }, [movies, index]);

  const goTo = useCallback(
    (i: number) => {
      if (movies.length === 0) return;
      const target = movies[((i % movies.length) + movies.length) % movies.length];
      if (failedIds.has(target.id)) return;
      setIndex(((i % movies.length) + movies.length) % movies.length);
    },
    [movies, failedIds],
  );

  if (movies.length === 0) {
    return null;
  }

  if (failedIds.size >= movies.length) {
    return null;
  }

  const current = movies[index];
  const src = videoUrlFor(current);

  return (
    <section className="w-full" aria-label="Trailere">
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-black shadow-lg">
        <video
          key={`${current.id}-${index}`}
          className="aspect-video w-full bg-black object-contain"
          controls
          playsInline
          muted
          autoPlay
          src={src}
          onEnded={advance}
          onError={handleError}
        />
      </div>
      <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Select trailer">
        {movies.map((m, i) => {
          const failed = failedIds.has(m.id);
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              disabled={failed}
              aria-selected={i === index}
              className={`h-2.5 w-2.5 rounded-full transition disabled:cursor-not-allowed disabled:opacity-30 ${i === index ? 'bg-rose-500' : 'bg-slate-600 hover:bg-slate-500'}`}
              onClick={() => goTo(i)}
              aria-label={`Trailer ${m.title}`}
            />
          );
        })}
      </div>
    </section>
  );
}
