import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { totalSelectedPrice, useBookingDraftStore } from '../stores/bookingDraftStore';

export function BookingConfirm() {
  const { screeningId: sid } = useParams();
  const screeningId = Number(sid);
  const nav = useNavigate();
  const draft = useBookingDraftStore();
  const reset = useBookingDraftStore((s) => s.reset);
  const selectedSeats = useBookingDraftStore((s) => s.selectedSeats);
  const total = totalSelectedPrice(selectedSeats);

  const pay = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/bookings', {
        screeningId,
        seatIds: selectedSeats.map((s) => s.seatId),
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Plată simulată — bilet emis!');
      reset();
      nav('/bilete');
    },
    onError: () => toast.error('Plată eșuată'),
  });

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
                Rând {s.row}, loc {s.col} · {s.seatType} · {s.price.toFixed(2)} MDL
              </li>
            ))}
          </ul>
          <p className="mt-3 text-lg font-semibold text-emerald-400">
            Total: {total.toFixed(2)} MDL
          </p>
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
