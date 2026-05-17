import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { AdminQueryList } from '../components/FetchBanner';
import { AdminAnalytics } from '../components/AdminAnalytics';
import { useAppLocale } from '../hooks/useAppLocale';
import { useMovieDisplayTitle } from '../hooks/useMovieDisplayTitle';
import type { AdminBookingRow, CursorPage, Hall, Movie, ScreeningRow } from '../types';

const navCls = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-2 text-sm ${isActive ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`;

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function Admin() {
  const { t } = useTranslation('admin');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('panelTitle')}</h1>
      <nav className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        <NavLink to="/admin/movies" className={navCls}>
          {t('movies')}
        </NavLink>
        <NavLink to="/admin/halls" className={navCls}>
          {t('halls')}
        </NavLink>
        <NavLink to="/admin/sessions" className={navCls}>
          {t('sessions')}
        </NavLink>
        <NavLink to="/admin/bookings" className={navCls}>
          {t('bookings')}
        </NavLink>
        <NavLink to="/admin/analytics" className={navCls}>
          {t('analytics')}
        </NavLink>
      </nav>
      <Routes>
        <Route index element={<Navigate to="movies" replace />} />
        <Route path="movies" element={<MoviesAdmin />} />
        <Route path="halls" element={<HallsAdmin />} />
        <Route path="sessions" element={<SessionsAdmin />} />
        <Route path="bookings" element={<BookingsAdmin />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Routes>
    </div>
  );
}

function MoviesAdmin() {
  const { t } = useTranslation(['admin', 'common']);
  const displayTitle = useMovieDisplayTitle();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['admin-movies'],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<Movie>>('/api/movies', { params: { limit: 50 } });
      return data;
    },
  });
  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/api/movies/${id}`),
    onSuccess: () => {
      toast.success(t('admin:deleted'));
      qc.invalidateQueries({ queryKey: ['admin-movies'] });
    },
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [duration, setDuration] = useState(100);
  const [formats, setFormats] = useState('2D');
  const [languages, setLanguages] = useState('EN,RO,RU');
  const [genres, setGenres] = useState('Dramă');
  const [actors, setActors] = useState('Actor');
  const [director, setDirector] = useState('');
  const [ageRating, setAgeRating] = useState('AP12');
  const [synopsis, setSynopsis] = useState('');
  const [posterUrl, setPosterUrl] = useState('https://placehold.co/400x600/1a1a2e/eee?text=Film');
  const [trailerUrl, setTrailerUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [status, setStatus] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');

  function resetMovieForm() {
    setEditingId(null);
    setTitle('');
    setOriginalTitle('');
    setTitleRu('');
    setDuration(100);
    setFormats('2D');
    setLanguages('EN,RO,RU');
    setGenres('Dramă');
    setActors('Actor');
    setDirector('');
    setAgeRating('AP12');
    setSynopsis('');
    setPosterUrl('https://placehold.co/400x600/1a1a2e/eee?text=Film');
    setTrailerUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
    setStatus('NOW_SHOWING');
  }

  async function beginEditMovie(id: number) {
    const { data: m } = await api.get<Movie>(`/api/movies/${id}`);
    setEditingId(id);
    setTitle(m.title);
    setOriginalTitle(m.originalTitle ?? m.title);
    setTitleRu(m.titleRu ?? '');
    setDuration(m.durationMin);
    setFormats((m.formats ?? []).join(','));
    setLanguages((m.languages ?? []).join(','));
    setGenres((m.genres ?? []).join(','));
    setActors((m.actors ?? []).join(','));
    setDirector(m.director ?? '');
    setAgeRating(m.ageRating ?? 'AP12');
    setSynopsis(m.synopsis ?? '');
    setPosterUrl(m.posterUrl ?? '');
    setTrailerUrl(m.trailerUrl ?? '');
    setStatus(m.status);
  }

  const saveMovie = useMutation({
    mutationFn: async () => {
      const body = {
        title,
        originalTitle: originalTitle || title,
        titleRu: titleRu || null,
        durationMin: duration,
        formats: formats.split(',').map((s) => s.trim()).filter(Boolean),
        languages: languages.split(',').map((s) => s.trim()).filter(Boolean),
        genres: genres.split(',').map((s) => s.trim()).filter(Boolean),
        director: director || null,
        actors: actors.split(',').map((s) => s.trim()).filter(Boolean),
        ageRating: ageRating || null,
        synopsis: synopsis || null,
        posterUrl,
        trailerUrl,
        status,
        releaseDate: null,
      };
      if (editingId != null) {
        await api.put(`/api/movies/${editingId}`, body);
      } else {
        await api.post('/api/movies', body);
      }
    },
    onSuccess: () => {
      toast.success(editingId != null ? t('admin:movieSaved') : t('admin:movieAdded'));
      qc.invalidateQueries({ queryKey: ['admin-movies'] });
      resetMovieForm();
    },
    onError: () => toast.error(t('common:error')),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-4 font-semibold">{t('admin:list')}</h2>
        <AdminQueryList query={q} emptyMessage={t('admin:noMovies')}>
          {(data) => (
            <ul className="space-y-2 text-sm">
              {data.items.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-800 bg-slate-900 px-3 py-2">
                  <span>{displayTitle(m)}</span>
                  <div className="flex gap-2">
                    <button type="button" className="text-rose-300 hover:underline" onClick={() => void beginEditMovie(m.id)}>
                      {t('common:edit')}
                    </button>
                    <button type="button" className="text-red-400 hover:underline" onClick={() => del.mutate(m.id)}>
                      {t('common:delete')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminQueryList>
      </div>
      <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">
          {editingId != null ? t('admin:editMovie', { id: editingId }) : t('admin:newMovie')}
        </h2>
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderTitle')} value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderOriginalTitle')} value={originalTitle} onChange={(e) => setOriginalTitle(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderTitleRu')} value={titleRu} onChange={(e) => setTitleRu(e.target.value)} />
        <input type="number" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderFormats')} value={formats} onChange={(e) => setFormats(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderLanguages')} value={languages} onChange={(e) => setLanguages(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderGenres')} value={genres} onChange={(e) => setGenres(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderActors')} value={actors} onChange={(e) => setActors(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderDirector')} value={director} onChange={(e) => setDirector(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderAgeRating')} value={ageRating} onChange={(e) => setAgeRating(e.target.value)} />
        <textarea className="min-h-[80px] w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderSynopsis')} value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderPoster')} value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:placeholderTrailer')} value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} />
        <select className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as 'NOW_SHOWING' | 'COMING_SOON')}>
          <option value="NOW_SHOWING">NOW_SHOWING</option>
          <option value="COMING_SOON">COMING_SOON</option>
        </select>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded bg-rose-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={!title || saveMovie.isPending}
            onClick={() => saveMovie.mutate()}
          >
            {editingId != null ? t('common:save') : t('common:add')}
          </button>
          {editingId != null && (
            <button type="button" className="rounded border border-slate-600 px-4 py-2 text-slate-300" onClick={() => resetMovieForm()}>
              {t('admin:cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HallsAdmin() {
  const { t } = useTranslation(['admin', 'common']);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['admin-halls'],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<Hall>>('/api/halls', { params: { limit: 50 } });
      return data;
    },
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState(() => t('admin:newHall'));
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(10);
  const [vipRows, setVipRows] = useState('6');

  function resetHallForm() {
    setEditingId(null);
    setName(t('admin:newHall'));
    setRows(6);
    setCols(10);
    setVipRows('6');
  }

  function beginEditHall(h: Hall) {
    setEditingId(h.id);
    setName(h.name);
    setRows(h.rowsCount);
    setCols(h.seatsPerRow);
    setVipRows((h.vipRows ?? []).join(','));
  }

  const saveHall = useMutation({
    mutationFn: async () => {
      const body = {
        name,
        rowsCount: rows,
        seatsPerRow: cols,
        vipRows: vipRows.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n)),
      };
      if (editingId != null) {
        await api.put(`/api/halls/${editingId}`, body);
      } else {
        await api.post('/api/halls', body);
      }
    },
    onSuccess: () => {
      toast.success(editingId != null ? t('admin:hallSaved') : t('admin:hallCreated'));
      qc.invalidateQueries({ queryKey: ['admin-halls'] });
      resetHallForm();
    },
    onError: () => toast.error(t('common:error')),
  });

  const delHall = useMutation({
    mutationFn: (id: number) => api.delete(`/api/halls/${id}`),
    onSuccess: () => {
      toast.success(t('admin:hallDeleted'));
      qc.invalidateQueries({ queryKey: ['admin-halls'] });
      resetHallForm();
    },
    onError: () => toast.error(t('common:error')),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {q.isPending && <p className="text-sm text-slate-400">{t('admin:loadingHalls')}</p>}
      {q.isError && <p className="text-sm text-red-400">{t('admin:loadHallsFailed')}</p>}
      <ul className="space-y-2 text-sm">
        {(q.data?.items ?? []).map((h) => (
          <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-800 bg-slate-900 px-3 py-2">
            <span>
              {h.name} — {h.rowsCount}x{h.seatsPerRow}
              {(h.vipRows?.length ?? 0) > 0
                ? ` · ${t('admin:hallVipLabel')} ${(h.vipRows ?? []).join(',')}`
                : ''}
            </span>
            <div className="flex gap-2">
              <button type="button" className="text-rose-300 hover:underline" onClick={() => beginEditHall(h)}>
                {t('common:edit')}
              </button>
              <button type="button" className="text-red-400 hover:underline" onClick={() => delHall.mutate(h.id)}>
                {t('common:delete')}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">
          {editingId != null ? t('admin:editHall', { id: editingId }) : t('admin:newHall')}
        </h2>
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
        <input type="number" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={cols} onChange={(e) => setCols(Number(e.target.value))} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder={t('admin:hallVipRows')} value={vipRows} onChange={(e) => setVipRows(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded bg-rose-600 px-4 py-2 text-white" onClick={() => saveHall.mutate()}>
            {editingId != null ? t('common:save') : t('admin:create')}
          </button>
          {editingId != null && (
            <button type="button" className="rounded border border-slate-600 px-4 py-2 text-slate-300" onClick={() => resetHallForm()}>
              {t('admin:cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionsAdmin() {
  const { t } = useTranslation(['admin', 'common']);
  const { formatDateTime } = useAppLocale();
  const displayTitle = useMovieDisplayTitle();
  const qc = useQueryClient();
  const movies = useQuery({
    queryKey: ['admin-movies-pick'],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<Movie>>('/api/movies', { params: { limit: 100 } });
      return data.items;
    },
  });
  const halls = useQuery({
    queryKey: ['admin-halls-pick'],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<Hall>>('/api/halls', { params: { limit: 50 } });
      return data.items;
    },
  });

  const [listDate, setListDate] = useState(todayIsoDate);
  const sessionsList = useQuery({
    queryKey: ['admin-sessions-list', listDate],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<ScreeningRow>>('/api/sessions', {
        params: { date: listDate, limit: 100 },
      });
      return data.items;
    },
  });

  const [editingScreeningId, setEditingScreeningId] = useState<number | null>(null);
  const [movieId, setMovieId] = useState<number>(1);
  const [hallId, setHallId] = useState<number>(1);
  const [startsLocal, setStartsLocal] = useState('');
  const [format, setFormat] = useState('TWO_D');
  const [language, setLanguage] = useState('RO');
  const [basePrice, setBasePrice] = useState(40);

  useEffect(() => {
    if (movies.data?.length) {
      setMovieId((prev) => (movies.data!.some((m) => m.id === prev) ? prev : movies.data![0].id));
    }
  }, [movies.data]);

  useEffect(() => {
    if (halls.data?.length) {
      setHallId((prev) => (halls.data!.some((h) => h.id === prev) ? prev : halls.data![0].id));
    }
  }, [halls.data]);

  function resetSessionForm() {
    setEditingScreeningId(null);
    setStartsLocal('');
    setBasePrice(40);
  }

  function beginEditSession(row: ScreeningRow) {
    setEditingScreeningId(row.screeningId);
    setMovieId(row.movieId);
    setHallId(row.hallId);
    setFormat(row.format);
    setLanguage(row.language);
    setBasePrice(row.basePrice != null ? Number(row.basePrice) : 40);
    setStartsLocal(toDatetimeLocalValue(row.startsAt));
  }

  const saveSession = useMutation({
    mutationFn: async () => {
      const iso = new Date(startsLocal).toISOString();
      const body = {
        movieId,
        hallId,
        startsAt: iso,
        format,
        language,
        basePrice,
      };
      if (editingScreeningId != null) {
        await api.put(`/api/sessions/${editingScreeningId}`, body);
      } else {
        await api.post('/api/sessions', body);
      }
    },
    onSuccess: () => {
      toast.success(editingScreeningId != null ? t('admin:sessionSaved') : t('admin:sessionCreated'));
      qc.invalidateQueries({ queryKey: ['admin-sessions-list'] });
      resetSessionForm();
    },
    onError: () => toast.error(t('admin:sessionConflict')),
  });

  const delSession = useMutation({
    mutationFn: (id: number) => api.delete(`/api/sessions/${id}`),
    onSuccess: () => {
      toast.success(t('admin:sessionDeleted'));
      qc.invalidateQueries({ queryKey: ['admin-sessions-list'] });
      resetSessionForm();
    },
    onError: () => toast.error(t('admin:sessionDeleteFailed')),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <h2 className="font-semibold">{t('admin:sessionsByDate')}</h2>
        <input
          type="date"
          className="w-full max-w-xs rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={listDate}
          onChange={(e) => setListDate(e.target.value)}
        />
        <AdminQueryList query={sessionsList} emptyMessage={t('admin:noSessionsDay')}>
          {(items) => (
        <ul className="max-h-[480px] space-y-2 overflow-y-auto text-sm">
          {items.map((s) => (
            <li key={s.screeningId} className="rounded border border-slate-800 bg-slate-900 px-3 py-2">
              <p className="font-medium">{displayTitle(s)}</p>
              <p className="text-slate-400">
                {formatDateTime(s.startsAt)} · {s.hallName} · {s.format} · {s.language} ·{' '}
                {s.basePrice != null ? Number(s.basePrice).toFixed(2) : '—'} {t('common:mdl')}
              </p>
              <div className="mt-2 flex gap-2">
                <button type="button" className="text-rose-300 hover:underline" onClick={() => beginEditSession(s)}>
                  {t('common:edit')}
                </button>
                <button type="button" className="text-red-400 hover:underline" onClick={() => delSession.mutate(s.screeningId)}>
                  {t('common:delete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
          )}
        </AdminQueryList>
      </div>
      <div className="max-w-md space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">
          {editingScreeningId != null ? t('admin:editSession', { id: editingScreeningId }) : t('admin:newSession')}
        </h2>
        <select className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={movieId} onChange={(e) => setMovieId(Number(e.target.value))}>
          {(movies.data ?? []).map((m) => (
            <option key={m.id} value={m.id}>
              {displayTitle(m)}
            </option>
          ))}
        </select>
        <select className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={hallId} onChange={(e) => setHallId(Number(e.target.value))}>
          {(halls.data ?? []).map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
        <input type="datetime-local" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={startsLocal} onChange={(e) => setStartsLocal(e.target.value)} />
        <select className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="TWO_D">2D</option>
          <option value="THREE_D">3D</option>
        </select>
        <select className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="RO">RO</option>
          <option value="RU">RU</option>
          <option value="EN">EN</option>
        </select>
        <input type="number" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded bg-rose-600 px-4 py-2 text-white"
            onClick={() => startsLocal && saveSession.mutate()}
          >
            {editingScreeningId != null ? t('admin:saveSession') : t('admin:createSession')}
          </button>
          {editingScreeningId != null && (
            <button type="button" className="rounded border border-slate-600 px-4 py-2 text-slate-300" onClick={() => resetSessionForm()}>
              {t('admin:cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingsAdmin() {
  const { t } = useTranslation(['admin', 'common']);
  const { formatDateTime } = useAppLocale();
  const displayTitle = useMovieDisplayTitle();
  const moviesPick = useQuery({
    queryKey: ['admin-bookings-movies'],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<Movie>>('/api/movies', { params: { limit: 100 } });
      return data.items;
    },
  });
  const [movieFilter, setMovieFilter] = useState<number | ''>('');
  const [dateFilter, setDateFilter] = useState('');

  const q = useQuery({
    queryKey: ['admin-bookings', movieFilter, dateFilter],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<AdminBookingRow>>('/api/admin/bookings', {
        params: {
          limit: 100,
          ...(movieFilter !== '' ? { movieId: movieFilter } : {}),
          ...(dateFilter ? { date: dateFilter } : {}),
        },
      });
      return data.items;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <select
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={movieFilter === '' ? '' : String(movieFilter)}
          onChange={(e) => setMovieFilter(e.target.value === '' ? '' : Number(e.target.value))}
        >
          <option value="">{t('admin:allMovies')}</option>
          {(moviesPick.data ?? []).map((m) => (
            <option key={m.id} value={m.id}>
              {displayTitle(m)}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <button
          type="button"
          className="rounded border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"
          onClick={() => {
            void api
              .get('/api/admin/bookings/export', {
                params: {
                  ...(movieFilter !== '' ? { movieId: movieFilter } : {}),
                  ...(dateFilter ? { date: dateFilter } : {}),
                },
                responseType: 'text',
              })
              .then(({ data }) => {
                const blob = new Blob([data], { type: 'text/csv' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'bookings.csv';
                a.click();
                URL.revokeObjectURL(a.href);
              })
              .catch(() => toast.error(t('common:error')));
          }}
        >
          {t('admin:exportCsv')}
        </button>
      </div>
      {q.isPending && <p className="text-sm text-slate-400">{t('admin:loadingBookings')}</p>}
      {q.isError && <p className="text-sm text-red-400">{t('admin:loadBookingsFailed')}</p>}
      <ul className="space-y-2 text-sm">
        {(q.data ?? []).map((b) => (
          <li key={b.bookingId} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-800 bg-slate-900 px-3 py-2">
            <span>
              #{b.bookingId} {b.userEmail} — {displayTitle(b)} —{' '}
              {formatDateTime(b.screeningStartsAt)} — {b.totalPrice} {t('common:mdl')} · {b.status}
            </span>
            {b.status === 'PAID' && new Date(b.screeningStartsAt).getTime() > Date.now() && (
              <button
                type="button"
                className="text-red-400 hover:underline"
                onClick={() =>
                  void api
                    .post(`/api/admin/bookings/${b.bookingId}/cancel`)
                    .then(() => {
                      toast.success(t('admin:bookingCancelled'));
                      void q.refetch();
                    })
                    .catch(() => toast.error(t('common:error')))
                }
              >
                {t('admin:cancelBooking')}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
