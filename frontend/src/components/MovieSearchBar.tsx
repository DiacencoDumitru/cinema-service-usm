import { useTranslation } from 'react-i18next';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function MovieSearchBar({ value, onChange }: Props) {
  const { t } = useTranslation('home');
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('searchPlaceholder')}
      className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white placeholder:text-slate-500"
    />
  );
}
