import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { AuroraPageHeader } from '../components/AuroraPageHeader';
import { FetchBanner, QueryErrorRetry } from '../components/FetchBanner';
import type { CursorPage, PriceRow } from '../types';
import {
  BIRTHDAY_DISCOUNT_PERCENT,
  BIRTHDAY_DISCOUNT_WINDOW_DAYS,
} from '../utils/birthdayDiscount';
import { categoryLabel, formatLabel } from '../utils/labels';

export function Pricing() {
  const { t } = useTranslation(['pricing', 'common']);
  const q = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<PriceRow>>('/api/prices');
      return data;
    },
  });

  return (
    <AuroraPageHeader title={t('pricing:title')} lead={t('pricing:lead')} maxWidth="6xl">
      <div className="relative space-y-4">
        <div className="rounded-xl border border-emerald-700/60 bg-emerald-900/30 p-4 text-sm text-emerald-100">
          {t('pricing:birthdayBanner', {
            percent: BIRTHDAY_DISCOUNT_PERCENT,
            days: BIRTHDAY_DISCOUNT_WINDOW_DAYS,
          })}
        </div>
        {q.isPending && <FetchBanner tone="load">{t('pricing:loading')}</FetchBanner>}
        {q.isError && (
          <QueryErrorRetry message={t('pricing:loadFailed')} onRetry={() => void q.refetch()} />
        )}
        {q.isSuccess && (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="p-3">{t('pricing:category')}</th>
                  <th className="p-3">{t('pricing:format')}</th>
                  <th className="p-3">{t('pricing:priceMdl')}</th>
                </tr>
              </thead>
              <tbody>
                {(q.data.items ?? []).map((row, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    <td className="p-3">{categoryLabel(t, row.category)}</td>
                    <td className="p-3">{formatLabel(t, row.format)}</td>
                    <td className="p-3">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {q.data.items.length === 0 && (
              <p className="p-4 text-center text-slate-500">{t('pricing:empty')}</p>
            )}
          </div>
        )}
      </div>
    </AuroraPageHeader>
  );
}
