import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { useBookingDraftStore } from '../stores/bookingDraftStore';
import type { BookingPaid } from '../types';
import { categoryLabel } from '../utils/labels';
import { bookingSeatsPayload } from '../utils/seatPrice';

export function BookingConfirm() {
  const { screeningId: sid } = useParams();
  const screeningId = Number(sid);
  const nav = useNavigate();
  const draft = useBookingDraftStore();
  const reset = useBookingDraftStore((s) => s.reset);
  const selectedSeats = useBookingDraftStore((s) => s.selectedSeats);
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.basePrice, 0);
  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const discountAmount = subtotal - total;

  useEffect(() => {
    if (!Number.isFinite(screeningId) || selectedSeats.length === 0) {
      nav(`/rezervare/${screeningId}`, { replace: true });
    }
  }, [nav, screeningId, selectedSeats.length]);

  const pay = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<BookingPaid>(
        '/api/bookings',
        bookingSeatsPayload(screeningId, selectedSeats),
      );
      return data;
    },
    onSuccess: () => {
      toast.success('Plată simulată — bilet emis!');
      reset();
      nav('/bilete');
    },
    onError: () => toast.error('Plată eșuată'),
  });

  if (selectedSeats.length === 0) {
    return <p className="text-slate-400">Redirecționare…</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Confirmare comandă</h1>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm">
        <p>
          <span className="text-slate-400">Film:</span> {draft.movieTitle}
        </p>
        <p>
          <span className="text-slate-400">Data:</span>{' '}
          {draft.startsAt ? new Date(draft.startsAt).toLocaleString('ro-RO') : '—'}
        </p>
        <p>
          <span className="text-slate-400">Sală:</span> {draft.hallName}
        </p>
        <div className="mt-3 border-t border-slate-800 pt-3">
          <p className="mb-2 font-medium text-slate-300">Locuri</p>
          <ul className="space-y-1 text-slate-300">
            {selectedSeats.map((s) => (
              <li key={s.seatId}>
                Rând {s.row}, loc {s.col} · {s.seatType} · {categoryLabel(s.priceCategory)} ·{' '}
                {s.price.toFixed(2)} MDL
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1">
            {discountAmount > 0 && (
              <>
                <p className="text-slate-300">Subtotal: {subtotal.toFixed(2)} MDL</p>
                <p className="text-emerald-300">
                  Reducere zi de naștere: −{discountAmount.toFixed(2)} MDL
                </p>
              </>
            )}
            <p className="text-lg font-semibold text-emerald-400">Total: {total.toFixed(2)} MDL</p>
          </div>
        </div>
      </div>
      <button
        type="button"
        disabled={pay.isPending}
        className="w-full rounded bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        onClick={() => pay.mutate()}
      >
        Plătește (simulare)
      </button>
      <Link className="block text-center text-sm text-rose-400" to={`/rezervare/${screeningId}`}>
        Înapoi la locuri
      </Link>
    </div>
  );
}
