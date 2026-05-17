import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { FetchBanner, QueryErrorRetry } from '../components/FetchBanner';
import { useAppLocale } from '../hooks/useAppLocale';
import { useMovieDisplayTitle } from '../hooks/useMovieDisplayTitle';
import type { BookingDetail } from '../types';

export function BookingTicket() {
  const { t } = useTranslation(['booking', 'common']);
  const { id } = useParams();
  const bookingId = Number(id);
  const { formatDateTime } = useAppLocale();
  const displayTitle = useMovieDisplayTitle();

  const q = useQuery({
    queryKey: ['booking-detail', bookingId],
    queryFn: async () => {
      const { data } = await api.get<BookingDetail>(`/api/user/bookings/${bookingId}`);
      return data;
    },
    enabled: Number.isFinite(bookingId),
  });

  if (q.isLoading) return <FetchBanner tone="load">{t('common:loading')}</FetchBanner>;
  if (q.isError || !q.data) {
    return <QueryErrorRetry message={t('booking:ticketLoadFailed')} onRetry={() => void q.refetch()} />;
  }

  const b = q.data;
  const qrPayload = JSON.stringify({ code: b.bookingCode, id: b.bookingId });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t('booking:ticketTitle')}</h1>
        <Link to="/bilete" className="text-sm text-rose-400 hover:underline">
          {t('booking:backToTickets')}
        </Link>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-slate-500">{t('booking:bookingCode')}</p>
        <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">{b.bookingCode}</p>
        <div className="mt-6 flex justify-center rounded-lg bg-white p-4">
          <QRCodeSVG value={qrPayload} size={180} level="M" />
        </div>
        <p className="mt-6 text-lg font-semibold text-white">{displayTitle(b)}</p>
        <p className="text-sm text-slate-400">
          {formatDateTime(b.screeningStartsAt)} · {b.hallName}
        </p>
        <ul className="mt-4 space-y-1 text-sm text-slate-300">
          {b.seats.map((s, i) => (
            <li key={i}>
              {t('booking:seatLine', { row: s.row, col: s.col, seatType: s.seatType, price: s.price })}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          {t('common:total')}: {b.totalPrice} {t('common:mdl')}
        </p>
      </div>
    </div>
  );
}
