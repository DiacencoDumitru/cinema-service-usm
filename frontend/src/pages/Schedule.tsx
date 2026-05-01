import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { CursorPage, ScreeningRow } from '../types';

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function Schedule() {
  const [dayIdx, setDayIdx] = useState(0);
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState<string | undefined>(undefined);

  const dates = useMemo(() => Array.from({ length: 8 }, (_, i) => addDays(new Date(), i)), []);
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Program</h1>
      <div className="flex flex-wrap gap-2">
        {dates.map((d, i) => (
          <button
            key={d.toISOString()}
            type="button"
            onClick={() => setDayIdx(i)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              i === dayIdx ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {d.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' })}
          </button>
        ))}
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
      <div className="space-y-4">
        {(q.data?.items ?? []).map((row) => (
          <div
            key={row.screeningId}
            className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4"
          >
            {row.posterUrl ? (
              <img
                src={row.posterUrl}
                alt=""
                className="h-24 w-16 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-24 w-16 shrink-0 rounded bg-slate-800" aria-hidden />
            )}
            <div className="flex-1">
              <Link className="text-lg font-semibold text-rose-400 hover:underline" to={`/film/${row.movieId}`}>
                {row.title}
              </Link>
              <p className="text-sm text-slate-400">
                {row.genres.join(', ')} · {row.durationMin} min · {row.ageRating}
              </p>
              <p className="text-sm">
                {new Date(row.startsAt).toLocaleString('ro-RO')} · {row.hallName} · {row.format} · {row.language}
              </p>
            </div>
            <Link
              className="rounded bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500"
              to={`/rezervare/${row.screeningId}`}
            >
              Locuri
            </Link>
          </div>
        ))}
        {q.data?.items.length === 0 && <p className="text-slate-500">Nu există seanse pentru această zi.</p>}
      </div>
    </div>
  );
}
