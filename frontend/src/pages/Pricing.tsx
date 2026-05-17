import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
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
    <div>
      <h1 className="mb-6 text-3xl font-bold">{t('pricing:title')}</h1>
      <div className="mb-4 rounded-lg border border-emerald-700 bg-emerald-900/30 p-4 text-sm text-emerald-100">
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
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900">
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
  );
}
