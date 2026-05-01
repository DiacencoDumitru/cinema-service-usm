import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
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
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panou admin</h1>
      <nav className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        <NavLink to="/admin/movies" className={navCls}>
          Filme
        </NavLink>
        <NavLink to="/admin/halls" className={navCls}>
          Săli
        </NavLink>
        <NavLink to="/admin/sessions" className={navCls}>
          Seanse
        </NavLink>
        <NavLink to="/admin/bookings" className={navCls}>
          Rezervări
        </NavLink>
      </nav>
      <Routes>
        <Route index element={<Navigate to="movies" replace />} />
        <Route path="movies" element={<MoviesAdmin />} />
        <Route path="halls" element={<HallsAdmin />} />
        <Route path="sessions" element={<SessionsAdmin />} />
        <Route path="bookings" element={<BookingsAdmin />} />
      </Routes>
    </div>
  );
}

function MoviesAdmin() {
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
      toast.success('Șters');
      qc.invalidateQueries({ queryKey: ['admin-movies'] });
    },
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
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
      toast.success(editingId != null ? 'Film salvat' : 'Film adăugat');
      qc.invalidateQueries({ queryKey: ['admin-movies'] });
      resetMovieForm();
    },
    onError: () => toast.error('Eroare'),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-4 font-semibold">Listă</h2>
        <ul className="space-y-2 text-sm">
          {(q.data?.items ?? []).map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-800 bg-slate-900 px-3 py-2">
              <span>{m.title}</span>
              <div className="flex gap-2">
                <button type="button" className="text-rose-300 hover:underline" onClick={() => void beginEditMovie(m.id)}>
                  Editează
                </button>
                <button type="button" className="text-red-400 hover:underline" onClick={() => del.mutate(m.id)}>
                  Șterge
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">{editingId != null ? `Editare film #${editingId}` : 'Film nou'}</h2>
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Titlu" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Titlu original" value={originalTitle} onChange={(e) => setOriginalTitle(e.target.value)} />
        <input type="number" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Formate (virgulă)" value={formats} onChange={(e) => setFormats(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Limbi (virgulă)" value={languages} onChange={(e) => setLanguages(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Genuri (virgulă)" value={genres} onChange={(e) => setGenres(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Actori (virgulă)" value={actors} onChange={(e) => setActors(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Regizor" value={director} onChange={(e) => setDirector(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Rating vârstă" value={ageRating} onChange={(e) => setAgeRating(e.target.value)} />
        <textarea className="min-h-[80px] w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Sinopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Poster URL" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Trailer URL (YouTube embed)" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} />
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
            {editingId != null ? 'Salvează' : 'Adaugă'}
          </button>
          {editingId != null && (
            <button type="button" className="rounded border border-slate-600 px-4 py-2 text-slate-300" onClick={() => resetMovieForm()}>
              Anulare
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HallsAdmin() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['admin-halls'],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<Hall>>('/api/halls', { params: { limit: 50 } });
      return data;
    },
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('Sală nouă');
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(10);
  const [vipRows, setVipRows] = useState('6');

  function resetHallForm() {
    setEditingId(null);
    setName('Sală nouă');
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
      toast.success(editingId != null ? 'Sală salvată' : 'Sală creată');
      qc.invalidateQueries({ queryKey: ['admin-halls'] });
      resetHallForm();
    },
    onError: () => toast.error('Eroare'),
  });

  const delHall = useMutation({
    mutationFn: (id: number) => api.delete(`/api/halls/${id}`),
    onSuccess: () => {
      toast.success('Sală ștearsă');
      qc.invalidateQueries({ queryKey: ['admin-halls'] });
      resetHallForm();
    },
    onError: () => toast.error('Eroare'),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ul className="space-y-2 text-sm">
        {(q.data?.items ?? []).map((h) => (
          <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-800 bg-slate-900 px-3 py-2">
            <span>
              {h.name} — {h.rowsCount}x{h.seatsPerRow}
              {(h.vipRows?.length ?? 0) > 0 ? ` · VIP rânduri: ${(h.vipRows ?? []).join(',')}` : ''}
            </span>
            <div className="flex gap-2">
              <button type="button" className="text-rose-300 hover:underline" onClick={() => beginEditHall(h)}>
                Editează
              </button>
              <button type="button" className="text-red-400 hover:underline" onClick={() => delHall.mutate(h.id)}>
                Șterge
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">{editingId != null ? `Editare sală #${editingId}` : 'Sală nouă'}</h2>
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
        <input type="number" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={cols} onChange={(e) => setCols(Number(e.target.value))} />
        <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Rânduri VIP (virgulă)" value={vipRows} onChange={(e) => setVipRows(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded bg-rose-600 px-4 py-2 text-white" onClick={() => saveHall.mutate()}>
            {editingId != null ? 'Salvează' : 'Creează'}
          </button>
          {editingId != null && (
            <button type="button" className="rounded border border-slate-600 px-4 py-2 text-slate-300" onClick={() => resetHallForm()}>
              Anulare
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionsAdmin() {
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
      toast.success(editingScreeningId != null ? 'Seans salvat' : 'Seans creat');
      qc.invalidateQueries({ queryKey: ['admin-sessions-list'] });
      resetSessionForm();
    },
    onError: () => toast.error('Conflict sau date invalide'),
  });

  const delSession = useMutation({
    mutationFn: (id: number) => api.delete(`/api/sessions/${id}`),
    onSuccess: () => {
      toast.success('Seans șters');
      qc.invalidateQueries({ queryKey: ['admin-sessions-list'] });
      resetSessionForm();
    },
    onError: () => toast.error('Nu se poate șterge (există rezervări?)'),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <h2 className="font-semibold">Seanse — data</h2>
        <input
          type="date"
          className="w-full max-w-xs rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={listDate}
          onChange={(e) => setListDate(e.target.value)}
        />
        <ul className="max-h-[480px] space-y-2 overflow-y-auto text-sm">
          {(sessionsList.data ?? []).map((s) => (
            <li key={s.screeningId} className="rounded border border-slate-800 bg-slate-900 px-3 py-2">
              <p className="font-medium">{s.title}</p>
              <p className="text-slate-400">
                {new Date(s.startsAt).toLocaleString('ro-RO')} · {s.hallName} · {s.format} · {s.language} · {s.basePrice != null ? Number(s.basePrice).toFixed(2) : '—'} MDL
              </p>
              <div className="mt-2 flex gap-2">
                <button type="button" className="text-rose-300 hover:underline" onClick={() => beginEditSession(s)}>
                  Editează
                </button>
                <button type="button" className="text-red-400 hover:underline" onClick={() => delSession.mutate(s.screeningId)}>
                  Șterge
                </button>
              </div>
            </li>
          ))}
        </ul>
        {sessionsList.data?.length === 0 && <p className="text-slate-500">Nu există seanse în această zi.</p>}
      </div>
      <div className="max-w-md space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">{editingScreeningId != null ? `Editare seans #${editingScreeningId}` : 'Seans nou'}</h2>
        <select className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" value={movieId} onChange={(e) => setMovieId(Number(e.target.value))}>
          {(movies.data ?? []).map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
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
            {editingScreeningId != null ? 'Salvează seans' : 'Creează seans'}
          </button>
          {editingScreeningId != null && (
            <button type="button" className="rounded border border-slate-600 px-4 py-2 text-slate-300" onClick={() => resetSessionForm()}>
              Anulare
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingsAdmin() {
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
          <option value="">Toate filmele</option>
          {(moviesPick.data ?? []).map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>
      <ul className="space-y-2 text-sm">
        {(q.data ?? []).map((b) => (
          <li key={b.bookingId} className="rounded border border-slate-800 bg-slate-900 px-3 py-2">
            #{b.bookingId} {b.userEmail} — {b.movieTitle} — {new Date(b.screeningStartsAt).toLocaleString('ro-RO')} — {b.totalPrice} MDL
          </li>
        ))}
      </ul>
    </div>
  );
}
