import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { BookingHistory, CursorPage } from '../types';

export function Bookings() {
  const q = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<BookingHistory>>('/api/user/bookings', { params: { limit: 50 } });
      return data;
    },
  });

  if (q.isLoading) return <p>Se încarcă…</p>;
  if (q.isError || !q.data) {
    return (
      <div className="space-y-3">
        <p className="text-red-400">Nu am putut încărca rezervările.</p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="rounded bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-500"
        >
          Reîncearcă
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Biletele mele</h1>
      <div className="space-y-4">
        {q.data.items.map((b) => (
          <div key={b.bookingId} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <p className="font-semibold text-white">{b.movieTitle}</p>
            <p className="text-sm text-slate-400">
              {new Date(b.screeningStartsAt).toLocaleString('ro-RO')} · {b.hallName}
            </p>
            <p className="text-sm">Total: {b.totalPrice} MDL</p>
            <ul className="mt-2 text-sm text-slate-300">
              {b.seats.map((s, i) => (
                <li key={i}>
                  Rând {s.row}, loc {s.col} ({s.seatType}) — {s.price} MDL
                </li>
              ))}
            </ul>
          </div>
        ))}
        {q.data.items.length === 0 && <p className="text-slate-500">Nicio rezervare încă.</p>}
      </div>
    </div>
  );
}
