import { useTranslation } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';

export function FetchBanner({ tone, children }: { tone: 'load' | 'err'; children: React.ReactNode }) {
  const cls =
    tone === 'load'
      ? 'border-slate-600 bg-slate-900/70 text-slate-300'
      : 'border-amber-700/60 bg-amber-950/35 text-amber-100';
  return (
    <p className={`rounded-xl border px-4 py-3 text-sm ${cls}`} role="status">
      {children}
    </p>
  );
}

export function QueryErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation('common');
  return (
    <div className="space-y-3">
      <FetchBanner tone="err">{message}</FetchBanner>
      <button
        type="button"
        onClick={onRetry}
        className="rounded bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-500"
      >
        {t('retry')}
      </button>
    </div>
  );
}

export function AdminQueryList<T>({
  query,
  emptyMessage,
  children,
}: {
  query: UseQueryResult<T, Error>;
  emptyMessage: string;
  children: (data: T) => React.ReactNode;
}) {
  const { t } = useTranslation('common');
  if (query.isPending) return <FetchBanner tone="load">{t('loading')}</FetchBanner>;
  if (query.isError) {
    return <QueryErrorRetry message={t('loadDataFailed')} onRetry={() => void query.refetch()} />;
  }
  if (!query.data) return null;
  const isEmpty = Array.isArray(query.data) && query.data.length === 0;
  if (isEmpty) return <p className="text-slate-500">{emptyMessage}</p>;
  return <>{children(query.data)}</>;
}
