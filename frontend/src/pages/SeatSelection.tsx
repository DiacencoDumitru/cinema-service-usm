import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { api } from '../api/client';
import { FetchBanner, QueryErrorRetry } from '../components/FetchBanner';
import type { PriceRow, Profile, ScreeningRow, SeatCell, SeatLockInfo, TicketPriceCategory } from '../types';
import { LockCountdownBanner } from '../components/LockCountdownBanner';
import { useBookingDraftStore } from '../stores/bookingDraftStore';
import {
  BIRTHDAY_DISCOUNT_PERCENT,
  applyBirthdayDiscount,
  isBirthdayWindow,
} from '../utils/birthdayDiscount';
import { categoryLabel } from '../utils/labels';
import { bookingSeatsPayload, resolveSeatPrice } from '../utils/seatPrice';
import { useAuthStore } from '../stores/authStore';
import { useAppLocale } from '../hooks/useAppLocale';
import { useMovieDisplayTitle } from '../hooks/useMovieDisplayTitle';
import { translateApiError } from '../utils/translateApiError';

const TICKET_CATEGORIES: TicketPriceCategory[] = ['STANDARD', 'CHILD', 'STUDENT'];

export function SeatSelection() {
  const { t } = useTranslation(['booking', 'common']);
  const { formatDateTime } = useAppLocale();
  const displayTitle = useMovieDisplayTitle();
  const { screeningId: sid } = useParams();
  const screeningId = Number(sid);
  const nav = useNavigate();
  const setScreening = useBookingDraftStore((s) => s.setScreening);
  const setLockExpiresAt = useBookingDraftStore((s) => s.setLockExpiresAt);
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
    setScreening(
      screeningId,
      {
        title: meta.data.title,
        originalTitle: meta.data.originalTitle,
        titleRu: meta.data.titleRu,
      },
      meta.data.startsAt,
      meta.data.hallName,
      meta.data.format,
      bp,
    );
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
      toast.error(t('booking:selectAtLeastOneSeat'));
      return;
    }
    try {
      const { data } = await api.post<SeatLockInfo>(
        '/api/bookings/lock',
        bookingSeatsPayload(screeningId, selectedSeats),
      );
      setLockExpiresAt(data.expiresAt);
      nav(`/rezervare/${screeningId}/confirm`);
    } catch (e) {
      const err = e as AxiosError<{ message?: string }>;
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 409) toast.error(msg ? translateApiError(t, msg) : t('booking:seatsTaken'));
      else if (status === 400) toast.error(msg ? translateApiError(t, msg) : t('booking:invalidSelection'));
      else if (status !== 401 && status !== 403) toast.error(t('booking:tryAgain'));
      await seats.refetch();
    }
  }

  if (!Number.isFinite(screeningId)) return <p>{t('booking:invalidScreening')}</p>;

  if (meta.isPending || prices.isPending || seats.isPending) {
    return <FetchBanner tone="load">{t('booking:loadingHall')}</FetchBanner>;
  }

  if (meta.isError || prices.isError || seats.isError || !meta.data) {
    return (
      <QueryErrorRetry
        message={t('booking:loadSessionFailed')}
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
        {t('booking:backToMovie')}
      </Link>
      <h1 className="text-2xl font-bold">{t('booking:chooseSeats')}</h1>
      <p className="text-slate-400">
        {displayTitle(meta.data)} · {formatDateTime(meta.data.startsAt)} · {meta.data.hallName}
      </p>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="text-slate-400" htmlFor="default-ticket-category">
          {t('booking:defaultTicketType')}
        </label>
        <select
          id="default-ticket-category"
          value={defaultCategory}
          onChange={(e) => setDefaultCategory(e.target.value as TicketPriceCategory)}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
        >
          {TICKET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(t, c)}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-500">{t('booking:seatLegend')}</p>
      {birthdayActive && (
        <div className="inline-block rounded-full border border-emerald-600 bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-100">
          {t('booking:birthdayBadge', { percent: BIRTHDAY_DISCOUNT_PERCENT })}
        </div>
      )}
      {standardPrice != null && childPrice != null && studentPrice != null && vipPrice != null && (
        <p className="text-sm text-slate-300">
          {t('booking:priceAdult')}{' '}
          <span className="font-semibold text-emerald-400">{priceForDisplay(standardPrice).toFixed(2)} {t('common:mdl')}</span>
          {' · '}
          {t('booking:priceChild')}{' '}
          <span className="font-semibold">{priceForDisplay(childPrice).toFixed(2)} {t('common:mdl')}</span>
          {' · '}
          {t('booking:priceStudent')}{' '}
          <span className="font-semibold">{priceForDisplay(studentPrice).toFixed(2)} {t('common:mdl')}</span>
          {' · '}
          {t('booking:priceVip')}{' '}
          <span className="font-semibold text-amber-400">{priceForDisplay(vipPrice).toFixed(2)} {t('common:mdl')}</span> (
          {meta.data.format})
        </p>
      )}
      <div className="inline-block rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="mb-4 text-center text-sm text-slate-500">{t('booking:screen')}</p>
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
                      title={`${c.seatType} · ${unitPrice.toFixed(2)} ${t('common:mdl')}`}
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
          <p className="mb-2 font-medium text-slate-300">{t('booking:selectedSeats')}</p>
          <ul className="space-y-2">
            {selectedSeats.map((s) => (
              <li key={s.seatId} className="flex flex-wrap items-center gap-2 text-slate-300">
                <span>
                  {t('common:row')} {s.row}, {t('common:seat')} {s.col} ({s.seatType})
                </span>
                <select
                  value={s.priceCategory}
                  onChange={(e) => updateSeatCategory(s.seatId, e.target.value as TicketPriceCategory)}
                  className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-white"
                  aria-label={t('booking:seatTicketAria', { row: s.row, col: s.col })}
                >
                  {TICKET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {categoryLabel(t, c)}
                    </option>
                  ))}
                </select>
                <span className="text-emerald-400">
                  {s.price.toFixed(2)} {t('common:mdl')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <LockCountdownBanner />
      <button
        type="button"
        className="rounded bg-rose-600 px-6 py-2 font-medium text-white hover:bg-rose-500"
        onClick={() => void handleContinue()}
      >
        {t('booking:continueToConfirm')}
      </button>
    </div>
  );
}
