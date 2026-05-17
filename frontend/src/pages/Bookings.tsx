import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { FetchBanner, QueryErrorRetry } from '../components/FetchBanner';
import type { BookingHistory, CursorPage } from '../types';

export function Bookings() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<BookingHistory>>('/api/user/bookings', { params: { limit: 50 } });
      return data;
    },
  });

  const cancel = useMutation({
    mutationFn: (bookingId: number) => api.post(`/api/bookings/${bookingId}/cancel`),
    onSuccess: () => {
      toast.success('Rezervare anulată');
      void qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: () => toast.error('Anularea a eșuat'),
  });

  if (q.isLoading) return <FetchBanner tone="load">Se încarcă…</FetchBanner>;
  if (q.isError || !q.data) {
    return (
      <QueryErrorRetry message="Nu am putut încărca rezervările." onRetry={() => void q.refetch()} />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Biletele mele</h1>
      <div className="space-y-4">
        {q.data.items.map((b) => {
          const isPaid = b.status === 'PAID';
          const screeningFuture = new Date(b.screeningStartsAt).getTime() > Date.now();
          return (
            <div key={b.bookingId} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-semibold text-white">{b.movieTitle}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    isPaid ? 'bg-emerald-900/50 text-emerald-200' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {isPaid ? 'Plătit' : 'Anulat'}
                </span>
              </div>
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
              {isPaid && screeningFuture && (
                <button
                  type="button"
                  disabled={cancel.isPending}
                  className="mt-3 rounded border border-red-700 px-3 py-1.5 text-sm text-red-300 hover:bg-red-950/40 disabled:opacity-50"
                  onClick={() => cancel.mutate(b.bookingId)}
                >
                  Anulează rezervarea
                </button>
              )}
            </div>
          );
        })}
        {q.data.items.length === 0 && <p className="text-slate-500">Nicio rezervare încă.</p>}
      </div>
    </div>
  );
}
