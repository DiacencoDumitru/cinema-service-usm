import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { useBookingDraftStore } from '../stores/bookingDraftStore';
import type { BookingPaid } from '../types';
import { categoryLabel } from '../utils/labels';
import { bookingSeatsPayload } from '../utils/seatPrice';
import { useAppLocale } from '../hooks/useAppLocale';
import { useMovieDisplayTitle } from '../hooks/useMovieDisplayTitle';

export function BookingConfirm() {
  const { t } = useTranslation(['booking', 'common']);
  const { formatDateTime } = useAppLocale();
  const displayTitle = useMovieDisplayTitle();
  const { screeningId: sid } = useParams();
  const screeningId = Number(sid);
  const nav = useNavigate();
  const draft = useBookingDraftStore();
  const reset = useBookingDraftStore((s) => s.reset);
  const selectedSeats = useBookingDraftStore((s) => s.selectedSeats);
  const [promoCode, setPromoCode] = useState('');
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
        bookingSeatsPayload(screeningId, selectedSeats, promoCode),
      );
      return data;
    },
    onSuccess: () => {
      toast.success(t('booking:paySuccess'));
      reset();
      nav('/bilete');
    },
    onError: () => toast.error(t('booking:payFailed')),
  });

  if (selectedSeats.length === 0) {
    return <p className="text-slate-400">{t('booking:redirecting')}</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{t('booking:confirmOrder')}</h1>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm">
        <p>
          <span className="text-slate-400">{t('booking:film')}</span>{' '}
          {draft.movieTitles ? displayTitle(draft.movieTitles) : '—'}
        </p>
        <p>
          <span className="text-slate-400">{t('booking:date')}</span>{' '}
          {draft.startsAt ? formatDateTime(draft.startsAt) : '—'}
        </p>
        <p>
          <span className="text-slate-400">{t('booking:hallLabel')}</span> {draft.hallName}
        </p>
        <div className="mt-3 border-t border-slate-800 pt-3">
          <p className="mb-2 font-medium text-slate-300">{t('booking:seatsLabel')}</p>
          <ul className="space-y-1 text-slate-300">
            {selectedSeats.map((s) => (
              <li key={s.seatId}>
                {t('common:row')} {s.row}, {t('common:seat')} {s.col} · {s.seatType} ·{' '}
                {categoryLabel(t, s.priceCategory)} · {s.price.toFixed(2)} {t('common:mdl')}
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1">
            {discountAmount > 0 && (
              <>
                <p className="text-slate-300">
                  {t('booking:subtotal')} {subtotal.toFixed(2)} {t('common:mdl')}
                </p>
                <p className="text-emerald-300">
                  {t('booking:birthdayDiscountLine')} −{discountAmount.toFixed(2)} {t('common:mdl')}
                </p>
              </>
            )}
            <p className="text-lg font-semibold text-emerald-400">
              {t('common:total')}: {total.toFixed(2)} {t('common:mdl')}
            </p>
          </div>
        </div>
      </div>
      <label className="block text-sm text-slate-400">
        {t('booking:promoCode')}
        <input
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          placeholder="WELCOME10"
        />
      </label>
      <button
        type="button"
        disabled={pay.isPending}
        className="w-full rounded bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        onClick={() => pay.mutate()}
      >
        {t('booking:paySimulated')}
      </button>
      <Link className="block text-center text-sm text-rose-400" to={`/rezervare/${screeningId}`}>
        {t('booking:confirmBack')}
      </Link>
    </div>
  );
}
