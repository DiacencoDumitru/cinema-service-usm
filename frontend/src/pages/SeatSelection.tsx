import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { api } from '../api/client';
import { FetchBanner, QueryErrorRetry } from '../components/FetchBanner';
import type { PriceRow, Profile, ScreeningRow, SeatCell, TicketPriceCategory } from '../types';
import { useBookingDraftStore } from '../stores/bookingDraftStore';
import {
  BIRTHDAY_DISCOUNT_PERCENT,
  applyBirthdayDiscount,
  isBirthdayWindow,
} from '../utils/birthdayDiscount';
import { categoryLabel } from '../utils/labels';
import { bookingSeatsPayload, resolveSeatPrice } from '../utils/seatPrice';
import { useAuthStore } from '../stores/authStore';

const TICKET_CATEGORIES: TicketPriceCategory[] = ['STANDARD', 'CHILD', 'STUDENT'];

export function SeatSelection() {
  const { screeningId: sid } = useParams();
  const screeningId = Number(sid);
  const nav = useNavigate();
  const setScreening = useBookingDraftStore((s) => s.setScreening);
  const toggleSeat = useBookingDraftStore((s) => s.toggleSeat);
  const setSeatPriceCategory = useBookingDraftStore((s) => s.setSeatPriceCategory);
  const selectedSeats = useBookingDraftStore((s) => s.selectedSeats);
  const [defaultCategory, setDefaultCategory] = useState<TicketPriceCategory>('STANDARD');

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

  const token = useAuthStore((s) => s.token);
  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<Profile>('/api/user/profile');
      return data;
    },
    enabled: Boolean(token),
  });

  const seats = useQuery({
    queryKey: ['session-seats', screeningId],
    queryFn: async () => {
      const { data } = await api.get<SeatCell[]>(`/api/sessions/${screeningId}/seats`);
      return data;
    },
    enabled: Number.isFinite(screeningId),
  });

  const birthdayActive = isBirthdayWindow(profile.data?.birthDate, meta.data?.startsAt);
  const priceForDisplay = (raw: number) => (birthdayActive ? applyBirthdayDiscount(raw) : raw);

  useEffect(() => {
    if (!meta.data) return;
    const bp =
      meta.data.basePrice === undefined || meta.data.basePrice === null
        ? 0
        : Number(meta.data.basePrice);
    setScreening(screeningId, meta.data.title, meta.data.startsAt, meta.data.hallName, meta.data.format, bp);
  }, [meta.data, screeningId, setScreening]);

  const byRow = useMemo(() => {
    const m = new Map<number, SeatCell[]>();
    for (const s of seats.data ?? []) {
      if (!m.has(s.row)) m.set(s.row, []);
      m.get(s.row)!.push(s);
    }
    for (const arr of m.values()) arr.sort((a, b) => a.col - b.col);
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [seats.data]);

  const basePriceFallback = meta.data?.basePrice ? Number(meta.data.basePrice) : 0;

  function rawPrice(seatType: string, ticketCategory: TicketPriceCategory) {
    if (!meta.data || !prices.data) return 0;
    return resolveSeatPrice(seatType, meta.data.format, prices.data, basePriceFallback, ticketCategory);
  }

  function updateSeatCategory(seatId: number, priceCategory: TicketPriceCategory) {
    const seat = selectedSeats.find((s) => s.seatId === seatId);
    if (!seat) return;
    const raw = rawPrice(seat.seatType, priceCategory);
    setSeatPriceCategory(seatId, priceCategory);
    useBookingDraftStore.setState({
      selectedSeats: useBookingDraftStore.getState().selectedSeats.map((s) =>
        s.seatId === seatId
          ? { ...s, priceCategory, basePrice: raw, price: priceForDisplay(raw) }
          : s,
      ),
    });
  }

  const standardPrice = meta.data && prices.data ? rawPrice('STANDARD', 'STANDARD') : null;
  const childPrice = meta.data && prices.data ? rawPrice('STANDARD', 'CHILD') : null;
  const studentPrice = meta.data && prices.data ? rawPrice('STANDARD', 'STUDENT') : null;
  const vipPrice = meta.data && prices.data ? rawPrice('VIP', 'STANDARD') : null;

  async function handleContinue() {
    if (selectedSeats.length === 0) {
      toast.error('Alege cel puțin un loc');
      return;
    }
    try {
      await api.post('/api/bookings/lock', bookingSeatsPayload(screeningId, selectedSeats));
      nav(`/rezervare/${screeningId}/confirm`);
    } catch (e) {
      const err = e as AxiosError<{ message?: string }>;
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 409) toast.error(msg ?? 'Locurile au fost rezervate deja');
      else if (status === 400) toast.error(msg ?? 'Selecție invalidă');
      else if (status !== 401 && status !== 403) toast.error('Eroare. Încearcă din nou');
      await seats.refetch();
    }
  }

  if (!Number.isFinite(screeningId)) return <p>Seans invalid.</p>;

  if (meta.isPending || prices.isPending || seats.isPending) {
    return <FetchBanner tone="load">Se încarcă sala și prețurile…</FetchBanner>;
  }

  if (meta.isError || prices.isError || seats.isError || !meta.data) {
    return (
      <QueryErrorRetry
        message="Nu s-au putut încărca datele seansului."
        onRetry={() => {
          void meta.refetch();
          void prices.refetch();
          void seats.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link className="text-sm text-rose-400 hover:underline" to={`/film/${meta.data.movieId}`}>
        ← Înapoi la film
      </Link>
      <h1 className="text-2xl font-bold">Alege locuri</h1>
      <p className="text-slate-400">
        {meta.data.title} · {new Date(meta.data.startsAt).toLocaleString('ro-RO')} · {meta.data.hallName}
      </p>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="text-slate-400" htmlFor="default-ticket-category">
          Tip bilet implicit:
        </label>
        <select
          id="default-ticket-category"
          value={defaultCategory}
          onChange={(e) => setDefaultCategory(e.target.value as TicketPriceCategory)}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
        >
          {TICKET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-500">
        Verde / aur = liber (standard / VIP) · Gri = ocupat · Galben = blocat alt utilizator · Contur = selectat de tine
      </p>
      {birthdayActive && (
        <div className="inline-block rounded-full border border-emerald-600 bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-100">
          Reducere {BIRTHDAY_DISCOUNT_PERCENT}% activă — zi de naștere
        </div>
      )}
      {standardPrice != null && childPrice != null && studentPrice != null && vipPrice != null && (
        <p className="text-sm text-slate-300">
          Adult standard:{' '}
          <span className="font-semibold text-emerald-400">{priceForDisplay(standardPrice).toFixed(2)} MDL</span>
          {' · '}
          Copil: <span className="font-semibold">{priceForDisplay(childPrice).toFixed(2)} MDL</span>
          {' · '}
          Student: <span className="font-semibold">{priceForDisplay(studentPrice).toFixed(2)} MDL</span>
          {' · '}
          VIP: <span className="font-semibold text-amber-400">{priceForDisplay(vipPrice).toFixed(2)} MDL</span> (
          {meta.data.format})
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
                  const basePrice = rawPrice(c.seatType, defaultCategory);
                  const unitPrice = priceForDisplay(basePrice);
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
                        if (!blocked) {
                          const raw = rawPrice(c.seatType, defaultCategory);
                          toggleSeat({
                            seatId: c.seatId,
                            row: c.row,
                            col: c.col,
                            seatType: c.seatType,
                            priceCategory: defaultCategory,
                            price: priceForDisplay(raw),
                            basePrice: raw,
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
      {selectedSeats.length > 0 && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm">
          <p className="mb-2 font-medium text-slate-300">Locuri selectate</p>
          <ul className="space-y-2">
            {selectedSeats.map((s) => (
              <li key={s.seatId} className="flex flex-wrap items-center gap-2 text-slate-300">
                <span>
                  Rând {s.row}, loc {s.col} ({s.seatType})
                </span>
                <select
                  value={s.priceCategory}
                  onChange={(e) => updateSeatCategory(s.seatId, e.target.value as TicketPriceCategory)}
                  className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-white"
                  aria-label={`Tip bilet rând ${s.row} loc ${s.col}`}
                >
                  {TICKET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {categoryLabel(c)}
                    </option>
                  ))}
                </select>
                <span className="text-emerald-400">{s.price.toFixed(2)} MDL</span>
              </li>
            ))}
          </ul>
        </div>
      )}
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

