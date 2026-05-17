import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api } from '../api/client';

export function ResetPassword() {
  const { t } = useTranslation(['auth', 'common']);
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get('token') ?? '');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/api/auth/reset-password', { token, newPassword: password });
      toast.success(t('auth:resetSuccess'));
    } catch {
      toast.error(t('auth:resetFailed'));
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="mb-4 text-2xl font-bold">{t('auth:resetTitle')}</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm text-slate-400">{t('auth:resetToken')}</label>
          <input
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">{t('auth:newPassword')}</label>
          <input
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <button type="submit" className="w-full rounded bg-rose-600 py-2 font-medium text-white hover:bg-rose-500">
          {t('auth:resetSubmit')}
        </button>
      </form>
      <Link to="/login" className="mt-4 block text-center text-sm text-rose-400">
        {t('auth:backToLogin')}
      </Link>
    </div>
  );
}
