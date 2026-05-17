import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';
import { FetchBanner } from './FetchBanner';

interface Analytics {
  revenueLast7Days: string;
  paidBookingsLast7Days: number;
  cancellationsLast7Days: number;
  topMovies: { movieId: number; title: string; bookingCount: number }[];
}

export function AdminAnalytics() {
  const { t } = useTranslation('admin');
  const q = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data } = await api.get<Analytics>('/api/admin/analytics/summary');
      return data;
    },
  });

  if (q.isLoading) return <FetchBanner tone="load">{t('loading')}</FetchBanner>;
  if (q.isError || !q.data) return <p className="text-red-400">{t('analyticsLoadFailed')}</p>;

  const chartData = q.data.topMovies.map((m) => ({
    name: m.title.length > 18 ? `${m.title.slice(0, 18)}…` : m.title,
    count: m.bookingCount,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500">{t('revenue7d')}</p>
          <p className="text-2xl font-bold text-emerald-400">{q.data.revenueLast7Days} MDL</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500">{t('paid7d')}</p>
          <p className="text-2xl font-bold">{q.data.paidBookingsLast7Days}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500">{t('cancelled7d')}</p>
          <p className="text-2xl font-bold">{q.data.cancellationsLast7Days}</p>
        </div>
      </div>
      {chartData.length > 0 && (
        <div className="h-64 rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="mb-2 text-sm text-slate-400">{t('topMovies')}</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
