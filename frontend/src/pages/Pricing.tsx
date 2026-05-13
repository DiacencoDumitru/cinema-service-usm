import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CursorPage, PriceRow } from '../types';
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
            {(q.data?.items ?? []).map((row, i) => (
              <tr key={i} className="border-t border-slate-800">
                <td className="p-3">{categoryLabel(row.category)}</td>
                <td className="p-3">{formatLabel(row.format)}</td>
                <td className="p-3">{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
