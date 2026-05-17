import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { FetchBanner, QueryErrorRetry } from '../components/FetchBanner';
import type { CursorPage, PriceRow } from '../types';
import {
  BIRTHDAY_DISCOUNT_PERCENT,
  BIRTHDAY_DISCOUNT_WINDOW_DAYS,
} from '../utils/birthdayDiscount';
import { categoryLabel, formatLabel } from '../utils/labels';

export function Pricing() {
  const q = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const { data } = await api.get<CursorPage<PriceRow>>('/api/prices');
      return data;
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Prețuri</h1>
      <div className="mb-4 rounded-lg border border-emerald-700 bg-emerald-900/30 p-4 text-sm text-emerald-100">
        La aniversare beneficiezi de o reducere de {BIRTHDAY_DISCOUNT_PERCENT}% la toate biletele
        timp de ±{BIRTHDAY_DISCOUNT_WINDOW_DAYS} zile. Adaugă data nașterii în profil pentru a o
        activa.
      </div>
      {q.isPending && <FetchBanner tone="load">Se încarcă prețurile…</FetchBanner>}
      {q.isError && (
        <QueryErrorRetry message="Nu s-au putut încărca prețurile." onRetry={() => void q.refetch()} />
      )}
      {q.isSuccess && (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-3">Categorie</th>
                <th className="p-3">Format</th>
                <th className="p-3">Preț (MDL)</th>
              </tr>
            </thead>
            <tbody>
              {(q.data.items ?? []).map((row, i) => (
                <tr key={i} className="border-t border-slate-800">
                  <td className="p-3">{categoryLabel(row.category)}</td>
                  <td className="p-3">{formatLabel(row.format)}</td>
                  <td className="p-3">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {q.data.items.length === 0 && (
            <p className="p-4 text-center text-slate-500">Niciun preț disponibil.</p>
          )}
        </div>
      )}
    </div>
  );
}
