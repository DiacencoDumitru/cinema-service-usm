import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import type { PriceRow, ScreeningRow, SeatCell } from '../types';
import { useBookingDraftStore } from '../stores/bookingDraftStore';

function resolveSeatPrice(seatType: string, screeningFormat: string, prices: PriceRow[], basePrice: number): number {
  const category = seatType === 'VIP' ? 'VIP' : 'STANDARD';
  const row = prices.find((p) => p.category === category && p.format === screeningFormat);
  if (row) return Number(row.amount);
  return basePrice;
}

export function SeatSelection() {
  const { screeningId: sid } = useParams();
  const screeningId = Number(sid);
  const nav = useNavigate();
  const setScreening = useBookingDraftStore((s) => s.setScreening);
  const toggleSeat = useBookingDraftStore((s) => s.toggleSeat);
  const selectedSeats = useBookingDraftStore((s) => s.selectedSeats);

  const meta = useQuery({
    queryKey: ['session-meta', screeningId],
    queryFn: async () => {
      const { data } = await api.get<ScreeningRow>(`/api/sessions/${screeningId}`);
      return data;
    },
    enabled: Number.isFinite(screeningId),
  });

  const prices = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const { data } = await api.get<{ items: PriceRow[] }>('/api/prices');
      return data.items;
    },
  });

  useEffect(() => {
    if (!meta.data) return;
    const bp =
      meta.data.basePrice === undefined || meta.data.basePrice === null
        ? 0
        : Number(meta.data.basePrice);
    setScreening(screeningId, meta.data.title, meta.data.startsAt, meta.data.hallName, meta.data.format, bp);
  }, [meta.data, screeningId, setScreening]);

  const seats = useQuery({
    queryKey: ['session-seats', screeningId],
    queryFn: async () => {
      const { data } = await api.get<SeatCell[]>(`/api/sessions/${screeningId}/seats`);
      return data;
    },
    enabled: Number.isFinite(screeningId),
  });

  const byRow = useMemo(() => {
    const m = new Map<number, SeatCell[]>();
    for (const s of seats.data ?? []) {
      if (!m.has(s.row)) m.set(s.row, []);
      m.get(s.row)!.push(s);
    }
    for (const arr of m.values()) arr.sort((a, b) => a.col - b.col);
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [seats.data]);

  const standardPrice =
    meta.data && prices.data
      ? resolveSeatPrice('STANDARD', meta.data.format, prices.data, meta.data.basePrice ? Number(meta.data.basePrice) : 0)
      : null;
  const vipPrice =
    meta.data && prices.data
      ? resolveSeatPrice('VIP', meta.data.format, prices.data, meta.data.basePrice ? Number(meta.data.basePrice) : 0)
      : null;

  async function handleContinue() {
    if (selectedSeats.length === 0) {
      toast.error('Alege cel puțin un loc');
      return;
    }
    try {
      await api.post('/api/bookings/lock', {
        screeningId,
        seatIds: selectedSeats.map((s) => s.seatId),
      });
      nav(`/rezervare/${screeningId}/confirm`);
    } catch {
      toast.error('Locurile nu sunt disponibile');
    }
  }

  if (!Number.isFinite(screeningId)) return <p>Seans invalid.</p>;

  return (
    <div className="space-y-6">
      <Link className="text-sm text-rose-400 hover:underline" to={`/film/${meta.data?.movieId ?? ''}`}>
        ← Înapoi la film
      </Link>
      <h1 className="text-2xl font-bold">Alege locuri</h1>
      {meta.data && (
        <p className="text-slate-400">
          {meta.data.title} · {new Date(meta.data.startsAt).toLocaleString('ro-RO')} · {meta.data.hallName}
        </p>
      )}
      <p className="text-xs text-slate-500">
        Verde / aur = liber (standard / VIP) · Gri = ocupat · Galben = blocat alt utilizator · Contur = selectat de tine
      </p>
      {standardPrice != null && vipPrice != null && (
        <p className="text-sm text-slate-300">
          Standard: <span className="font-semibold text-emerald-400">{standardPrice.toFixed(2)} MDL</span> · VIP:{' '}
          <span className="font-semibold text-amber-400">{vipPrice.toFixed(2)} MDL</span> ({meta.data?.format})
        </p>
      )}
      <div className="inline-block rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="mb-4 text-center text-sm text-slate-500">Ecran</p>
        <div className="space-y-2">
          {byRow.map(([row, cells]) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-8 text-right text-xs text-slate-500">{row}</span>
              <div className="flex gap-1">
                {cells.map((c) => {
                  const isSel = selectedSeats.some((s) => s.seatId === c.seatId);
                  const isVip = c.seatType === 'VIP';
                  const unitPrice =
                    meta.data && prices.data
                      ? resolveSeatPrice(
                          c.seatType,
                          meta.data.format,
                          prices.data,
                          meta.data.basePrice ? Number(meta.data.basePrice) : 0,
                        )
                      : 0;
                  let cls = 'h-9 w-9 rounded text-xs font-medium ';
                  if (c.status === 'BOOKED') cls += 'bg-slate-700 text-slate-500 cursor-not-allowed';
                  else if (c.status === 'LOCKED') cls += 'bg-amber-900/50 text-amber-200 cursor-not-allowed';
                  else if (c.status === 'HELD') cls += 'bg-amber-500 text-slate-900';
                  else if (isSel) {
                    cls += isVip
                      ? 'ring-2 ring-amber-300 bg-amber-700 text-white '
                      : 'ring-2 ring-rose-500 bg-emerald-700 text-white ';
                  } else if (isVip) cls += 'bg-amber-600 hover:bg-amber-500 text-white ';
                  else cls += 'bg-emerald-600 hover:bg-emerald-500 text-white ';
                  const blocked = c.status === 'BOOKED' || c.status === 'LOCKED';
                  return (
                    <button
                      key={c.seatId}
                      type="button"
                      disabled={blocked}
                      title={`${c.seatType} · ${unitPrice.toFixed(2)} MDL`}
                      className={cls}
                      onClick={() => {
                        if (!blocked && meta.data && prices.data) {
                          const price = resolveSeatPrice(
                            c.seatType,
                            meta.data.format,
                            prices.data,
                            meta.data.basePrice ? Number(meta.data.basePrice) : 0,
                          );
                          toggleSeat({
                            seatId: c.seatId,
                            row: c.row,
                            col: c.col,
                            seatType: c.seatType,
                            price,
                          });
                        }
                      }}
                    >
                      {c.col}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="rounded bg-rose-600 px-6 py-2 font-medium text-white hover:bg-rose-500"
        onClick={() => void handleContinue()}
      >
        Continuă la confirmare
      </button>
    </div>
  );
}
