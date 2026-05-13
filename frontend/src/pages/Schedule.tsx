import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { CursorPage, Movie, ScreeningRow } from '../types';
import { formatLabel } from '../utils/labels';

const FALLBACK_POSTER =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%230f172a'/%3E%3Cstop offset='100%25' stop-color='%231e293b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g)'/%3E%3Ctext x='50%25' y='48%25' dominant-baseline='middle' text-anchor='middle' fill='%23e2e8f0' font-family='Arial,sans-serif' font-size='26'%3EAurora%20Cinema%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='Arial,sans-serif' font-size='18'%3EPoster unavailable%3C/text%3E%3C/svg%3E";

const DATE_RANGE_DAYS = 14;

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDdMm(d: Date) {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`;
}

function labelForDayIndex(i: number, d: Date) {
  if (i === 0) return 'ASTĂZI';
  if (i === 1) return 'MÂINE';
  return formatDdMm(d);
}

function formatReleaseDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function Schedule() {
  const [dayIdx, setDayIdx] = useState(0);
  const [selectedScreeningId, setSelectedScreeningId] = useState<number | null>(null);
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState<string | undefined>(undefined);

  const dates = useMemo(
    () => Array.from({ length: DATE_RANGE_DAYS }, (_, i) => addDays(new Date(), i)),
    [],
  );
  const selectedDate = dates[dayIdx];
  const dateStr = toIsoDate(selectedDate);

  const q = useQuery({
    queryKey: ['schedule', dateStr, genre, language],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<ScreeningRow>>(`/api/sessions`, {
        params: {
          date: dateStr,
          genres: genre || undefined,
          language,
          limit: 100,
        },
      });
      return data;
    },
  });

  const sortedItems = useMemo(() => {
    const items = [...(q.data?.items ?? [])];
    items.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    return items;
  }, [q.data?.items]);

  useEffect(() => {
    if (sortedItems.length === 0) {
      setSelectedScreeningId(null);
      return;
    }
    setSelectedScreeningId((prev) => {
      if (prev != null && sortedItems.some((r) => r.screeningId === prev)) return prev;
      return sortedItems[0].screeningId;
    });
  }, [sortedItems]);

  const selectedRow = sortedItems.find((r) => r.screeningId === selectedScreeningId) ?? null;

  const movieQ = useQuery({
    queryKey: ['movie', selectedRow?.movieId],
    queryFn: async () => {
      const { data } = await api.get<Movie>(`/api/movies/${selectedRow!.movieId}`);
      return data;
    },
    enabled: selectedRow != null,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Program</h1>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full border border-emerald-600/80 bg-emerald-900/40 px-4 py-2 text-sm font-semibold text-emerald-100"
          title="Locație"
        >
          Aurora Cinema Chișinău
        </span>
      </div>

      <div className="flex max-w-3xl flex-wrap gap-2">
        {dates.map((d, i) => {
          const active = i === dayIdx;
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => setDayIdx(i)}
              className={`min-w-[4.25rem] rounded-md border px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide transition-colors sm:text-sm ${
                active
                  ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
                  : 'border-slate-600 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80'
              }`}
            >
              <span className="block leading-tight">{labelForDayIndex(i, d)}</span>
              {i <= 1 ? (
                <span
                  className={`mt-0.5 block text-[10px] font-normal normal-case sm:text-xs ${
                    active ? 'text-emerald-100/90' : 'text-slate-400'
                  }`}
                >
                  {formatDdMm(d)}
                </span>
              ) : (
                <span
                  className={`mt-0.5 block text-[10px] font-normal normal-case sm:text-xs ${
                    active ? 'text-emerald-100/90' : 'text-slate-400'
                  }`}
                >
                  {d.toLocaleDateString('ro-RO', { weekday: 'short' })}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4">
        <input
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          placeholder="Gen (ex: Dramă,SF) — separate prin virgulă"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
        <select
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={language ?? ''}
          onChange={(e) => setLanguage(e.target.value || undefined)}
        >
          <option value="">Toate limbile</option>
          <option value="RO">RO</option>
          <option value="RU">RU</option>
          <option value="EN">EN</option>
        </select>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start">
        <div className="min-w-0 space-y-2">
          {sortedItems.map((row) => {
            const active = row.screeningId === selectedScreeningId;
            const start = new Date(row.startsAt);
            const timeStr = start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
            return (
              <button
                key={row.screeningId}
                type="button"
                onClick={() => setSelectedScreeningId(row.screeningId)}
                className={`flex w-full flex-wrap items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors sm:gap-4 sm:px-4 ${
                  active
                    ? 'border-rose-500 bg-slate-900/90 ring-1 ring-rose-500/40'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <span className="w-14 shrink-0 text-base font-bold tabular-nums text-slate-100">{timeStr}</span>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-100">
                    {row.title}
                    <span className="font-normal text-slate-400"> ({row.language})</span>
                  </span>
                  <p className="text-sm text-slate-500">{row.hallName}</p>
                </div>
                <Link
                  className="shrink-0 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-emerald-600"
                  to={`/rezervare/${row.screeningId}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  Locuri
                </Link>
              </button>
            );
          })}
          {sortedItems.length === 0 && (
            <p className="text-slate-500">Nu există seanse pentru această zi.</p>
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          {selectedRow == null ? (
            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center text-sm text-slate-500">
              Selectați o seansă din listă.
            </div>
          ) : (
            <div
              key={selectedRow.screeningId}
              className="animate-schedule-panel-in space-y-4 rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-lg"
            >
              <img
                src={selectedRow.posterUrl || FALLBACK_POSTER}
                alt=""
                className="mx-auto w-full max-w-[220px] rounded-md object-cover shadow-md"
              />
              <div>
                <Link
                  className="text-lg font-bold text-rose-400 hover:underline"
                  to={`/film/${selectedRow.movieId}`}
                >
                  {selectedRow.title}
                </Link>
              </div>

              {movieQ.isLoading && <p className="text-sm text-slate-500">Se încarcă detaliile…</p>}
              {movieQ.isError && (
                <p className="text-sm text-amber-500">Detaliile filmului nu au putut fi încărcate.</p>
              )}
              {movieQ.data && (
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-bold uppercase tracking-wide text-emerald-600/90">Gen</dt>
                    <dd className="text-slate-200">{movieQ.data.genres.join(', ')}</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-wide text-emerald-600/90">Audio</dt>
                    <dd className="text-slate-200">
                      {selectedRow.language}
                      {movieQ.data.languages.length ? (
                        <span className="text-slate-500"> · disponibil: {movieQ.data.languages.join(', ')}</span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-wide text-emerald-600/90">Limită de vârstă</dt>
                    <dd className="text-slate-200">{selectedRow.ageRating ?? movieQ.data.ageRating ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-wide text-emerald-600/90">Durată</dt>
                    <dd className="text-slate-200">
                      {Math.floor(movieQ.data.durationMin / 60)} h {movieQ.data.durationMin % 60} min
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-wide text-emerald-600/90">Dată lansare</dt>
                    <dd className="text-slate-200">{formatReleaseDate(movieQ.data.releaseDate)}</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-wide text-emerald-600/90">Format</dt>
                    <dd className="text-slate-200">{formatLabel(selectedRow.format)}</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-wide text-emerald-600/90">Actori</dt>
                    <dd className="text-slate-200">{movieQ.data.actors.join(', ') || '—'}</dd>
                  </div>
                  {movieQ.data.synopsis && (
                    <div className="border-t border-slate-800 pt-3">
                      <dt className="mb-1 font-bold uppercase tracking-wide text-emerald-600/90">Descriere</dt>
                      <dd className="text-slate-300 leading-relaxed">{movieQ.data.synopsis}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
