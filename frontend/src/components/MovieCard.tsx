import { Link } from 'react-router-dom';
import { useMovieDisplayTitle } from '../hooks/useMovieDisplayTitle';
import type { Movie } from '../types';

export const FALLBACK_POSTER =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%230f172a'/%3E%3Cstop offset='100%25' stop-color='%231e293b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g)'/%3E%3Ctext x='50%25' y='48%25' dominant-baseline='middle' text-anchor='middle' fill='%23e2e8f0' font-family='Arial,sans-serif' font-size='26'%3EAurora%20Cinema%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='Arial,sans-serif' font-size='18'%3EPoster unavailable%3C/text%3E%3C/svg%3E";

export function MovieCard({ movie, className = '' }: { movie: Movie; className?: string }) {
  const displayTitle = useMovieDisplayTitle();
  const fmt = movie.formats ?? [];
  const lang = movie.languages ?? [];
  return (
    <Link
      to={`/film/${movie.id}`}
      className={`block overflow-hidden rounded-lg border border-slate-800 bg-slate-900 transition hover:border-rose-500 ${className}`}
    >
      <img
        src={movie.posterUrl || FALLBACK_POSTER}
        alt=""
        className="aspect-[2/3] w-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_POSTER;
        }}
      />
      <div className="p-3">
        <p className="font-medium text-white">{displayTitle(movie)}</p>
        <p className="text-sm text-slate-400">{movie.genres.join(', ')}</p>
        <p className="text-xs text-amber-400">{movie.ageRating}</p>
        <p className="text-xs text-amber-400">
          {fmt.join('/')} {lang.join('-')}
        </p>
      </div>
    </Link>
  );
}
