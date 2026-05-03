import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Movie, ScreeningRow } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useBookingDraftStore } from '../stores/bookingDraftStore';

const FALLBACK_POSTER =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%230f172a'/%3E%3Cstop offset='100%25' stop-color='%231e293b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g)'/%3E%3Ctext x='50%25' y='48%25' dominant-baseline='middle' text-anchor='middle' fill='%23e2e8f0' font-family='Arial,sans-serif' font-size='26'%3EAurora%20Cinema%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='Arial,sans-serif' font-size='18'%3EPoster unavailable%3C/text%3E%3C/svg%3E";

export function MovieDetail() {
  const { id } = useParams();
  const movieId = Number(id);
  const token = useAuthStore((s) => s.token);
  const setScreening = useBookingDraftStore((s) => s.setScreening);

  const movie = useQuery({
    queryKey: ['movie', movieId],
    queryFn: async () => {
      const { data } = await api.get<Movie>(`/api/movies/${movieId}`);
      return data;
    },
    enabled: Number.isFinite(movieId),
  });

  const screenings = useQuery({
    queryKey: ['movie-screenings', movieId],
    queryFn: async () => {
      const { data } = await api.get<ScreeningRow[]>(`/api/movies/${movieId}/screenings`);
      return data;
    },
    enabled: Number.isFinite(movieId),
  });

  const grouped = new Map<string, ScreeningRow[]>();
  for (const s of screenings.data ?? []) {
    const day = new Date(s.startsAt).toLocaleDateString('ro-RO');
    if (!grouped.has(day)) grouped.set(day, []);
    grouped.get(day)!.push(s);
  }

  const trailer = movie.data?.trailerUrl;

  if (movie.isLoading) return <p>Se încarcă…</p>;
  if (!movie.data) return <p>Film negăsit.</p>;

  const m = movie.data;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div>
        <img
          src={m.posterUrl || FALLBACK_POSTER}
          alt=""
          className="w-full rounded-xl border border-slate-800"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_POSTER;
          }}
        />
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{m.title}</h1>
        <p className="text-slate-400">{m.originalTitle}</p>
        <p className="text-xs text-amber-400">
          {(m.formats ?? []).join('/')} {(m.languages ?? []).join('-')}
        </p>
        <p className="text-sm">
          {m.durationMin} min · {m.genres.join(', ')} · {m.ageRating}
        </p>
        <p>
          <span className="font-semibold text-slate-300">Regia:</span> {m.director}
        </p>
        <p>
          <span className="font-semibold text-slate-300">Actori:</span> {m.actors.join(', ')}
        </p>
        <p className="leading-relaxed text-slate-300">{m.synopsis}</p>
        {trailer && (
          <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-slate-800">
            <iframe title="trailer" className="h-full w-full" src={trailer} allowFullScreen />
          </div>
        )}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Seanse</h2>
          {[...grouped.entries()].map(([day, rows]) => (
            <div key={day}>
              <p className="mb-2 font-medium text-rose-400">{day}</p>
              <ul className="space-y-2">
                {rows.map((s) => (
                  <li key={s.screeningId} className="flex flex-wrap items-center gap-3 text-sm">
                    <span>{new Date(s.startsAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-slate-400">
                      {s.hallName} · {s.format} · {s.language}
                    </span>
                    {token ? (
                      <Link
                        className="rounded bg-rose-600 px-3 py-1 text-white hover:bg-rose-500"
                        to={`/rezervare/${s.screeningId}`}
                        onClick={() =>
                          setScreening(
                            s.screeningId,
                            m.title,
                            s.startsAt,
                            s.hallName,
                            s.format,
                            s.basePrice != null ? Number(s.basePrice) : 0,
                          )
                        }
                      >
                        Cumpără bilet
                      </Link>
                    ) : (
                      <Link className="text-rose-400 underline" to="/login">
                        Autentifică-te pentru bilete
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
