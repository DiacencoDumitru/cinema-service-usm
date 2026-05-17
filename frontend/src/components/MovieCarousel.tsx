import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Movie } from '../types';
import { MovieCard } from './MovieCard';

const GAP_PX = 16;
const AUTO_MS = 5000;

function useCarouselVisible(): number {
  const [visible, setVisible] = useState(5);
  useEffect(() => {
    const mqLg = window.matchMedia('(min-width: 1024px)');
    const mqMd = window.matchMedia('(min-width: 768px)');
    const mqSm = window.matchMedia('(min-width: 640px)');
    const update = () => {
      if (mqLg.matches) setVisible(5);
      else if (mqMd.matches) setVisible(3);
      else if (mqSm.matches) setVisible(2);
      else setVisible(1);
    };
    update();
    mqLg.addEventListener('change', update);
    mqMd.addEventListener('change', update);
    mqSm.addEventListener('change', update);
    return () => {
      mqLg.removeEventListener('change', update);
      mqMd.removeEventListener('change', update);
      mqSm.removeEventListener('change', update);
    };
  }, []);
  return visible;
}

type Props = { title: string; movies: Movie[] };

export function MovieCarousel({ title, movies }: Props) {
  const { t } = useTranslation('home');
  const visible = useCarouselVisible();
  const viewportRef = useRef<HTMLDivElement>(null);
  const mouseInsideRef = useRef(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const maxIndex = Math.max(0, movies.length - visible);
  const cardWidth =
    viewportWidth > 0 && visible > 0 ? (viewportWidth - (visible - 1) * GAP_PX) / visible : 0;
  const step = cardWidth + GAP_PX;

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (el) setViewportWidth(el.getBoundingClientRect().width);
  }, [visible, movies.length]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setViewportWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex, movies.length, visible]);

  const next = useCallback(() => {
    setTimerKey((k) => k + 1);
    setIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setTimerKey((k) => k + 1);
    setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (movies.length <= visible || maxIndex === 0 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [movies.length, visible, maxIndex, paused, timerKey]);

  const showControls = movies.length > visible && maxIndex > 0;

  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
      {movies.length === 0 ? (
        <p className="text-slate-500">{t('noMovies')}</p>
      ) : (
        <div
          className="relative"
          onMouseEnter={() => {
            mouseInsideRef.current = true;
            setPaused(true);
          }}
          onMouseLeave={() => {
            mouseInsideRef.current = false;
            setPaused(false);
          }}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node) && !mouseInsideRef.current) {
              setPaused(false);
            }
          }}
        >
          {showControls && (
            <>
              <button
                type="button"
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-600 bg-slate-900/90 px-3 py-2 text-lg leading-none text-white shadow hover:bg-slate-800"
                onClick={prev}
                aria-label={t('carouselPrev')}
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-600 bg-slate-900/90 px-3 py-2 text-lg leading-none text-white shadow hover:bg-slate-800"
                onClick={next}
                aria-label={t('carouselNext')}
              >
                ›
              </button>
            </>
          )}
          <div ref={viewportRef} className={`overflow-hidden ${showControls ? 'px-10' : ''}`}>
            <div
              className="flex gap-4 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${index * step}px)`,
              }}
            >
              {movies.map((m) => (
                <div key={m.id} className="shrink-0" style={{ width: Math.max(cardWidth, 0) || undefined }}>
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
