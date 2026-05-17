import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { AuroraPageHeader } from '../components/AuroraPageHeader';
import { FetchBanner, QueryErrorRetry } from '../components/FetchBanner';
import { useAppLocale } from '../hooks/useAppLocale';
import { useMovieDisplayTitle } from '../hooks/useMovieDisplayTitle';
import type { BookingHistory, CursorPage } from '../types';

export function Bookings() {
  const { t } = useTranslation(['booking', 'common']);
  const { formatDateTime } = useAppLocale();
  const displayTitle = useMovieDisplayTitle();
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
      toast.success(t('booking:cancelSuccess'));
      void qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: () => toast.error(t('booking:cancelFailed')),
  });

  if (q.isLoading) {
    return (
      <AuroraPageHeader title={t('booking:myTicketsTitle')} lead={t('booking:myTicketsLead')} maxWidth="6xl">
        <FetchBanner tone="load">{t('common:loading')}</FetchBanner>
      </AuroraPageHeader>
    );
  }

  if (q.isError || !q.data) {
    return (
      <AuroraPageHeader title={t('booking:myTicketsTitle')} lead={t('booking:myTicketsLead')} maxWidth="6xl">
        <QueryErrorRetry message={t('booking:loadBookingsFailed')} onRetry={() => void q.refetch()} />
      </AuroraPageHeader>
    );
  }

  return (
    <AuroraPageHeader title={t('booking:myTicketsTitle')} lead={t('booking:myTicketsLead')} maxWidth="6xl">
      <div className="relative space-y-4">
        {q.data.items.map((b) => {
          const isPaid = b.status === 'PAID';
          const screeningFuture = new Date(b.screeningStartsAt).getTime() > Date.now();
          return (
            <div
              key={b.bookingId}
              className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 transition-colors hover:border-emerald-500/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{displayTitle(b)}</p>
                  {b.bookingCode && (
                    <p className="font-mono text-xs text-slate-500">{b.bookingCode}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    isPaid ? 'bg-emerald-900/50 text-emerald-200' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {isPaid ? t('booking:statusPaid') : t('booking:statusCancelled')}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {formatDateTime(b.screeningStartsAt)} · {b.hallName}
              </p>
              <p className="text-sm">
                {t('common:total')}: {b.totalPrice} {t('common:mdl')}
              </p>
              <ul className="mt-2 text-sm text-slate-300">
                {b.seats.map((s, i) => (
                  <li key={i}>
                    {t('booking:seatLine', {
                      row: s.row,
                      col: s.col,
                      seatType: s.seatType,
                      price: s.price,
                    })}
                  </li>
                ))}
              </ul>
              {isPaid && (
                <Link
                  to={`/bilete/${b.bookingId}`}
                  className="mt-3 inline-block rounded bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  {t('booking:viewTicket')}
                </Link>
              )}
              {isPaid && screeningFuture && (
                <button
                  type="button"
                  disabled={cancel.isPending}
                  className="mt-3 rounded border border-red-700 px-3 py-1.5 text-sm text-red-300 hover:bg-red-950/40 disabled:opacity-50"
                  onClick={() => cancel.mutate(b.bookingId)}
                >
                  {t('booking:cancelBooking')}
                </button>
              )}
            </div>
          );
        })}
        {q.data.items.length === 0 && <p className="text-slate-500">{t('booking:noBookings')}</p>}
      </div>
    </AuroraPageHeader>
  );
}
