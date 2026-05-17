import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api } from '../api/client';

export function ForgotPassword() {
  const { t } = useTranslation(['auth', 'common']);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success(t('auth:forgotSent'));
    } catch {
      toast.error(t('auth:forgotFailed'));
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="mb-4 text-2xl font-bold">{t('auth:forgotTitle')}</h1>
      {sent ? (
        <p className="text-slate-300">{t('auth:forgotHint')}</p>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm text-slate-400">{t('common:email')}</label>
            <input
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full rounded bg-rose-600 py-2 font-medium text-white hover:bg-rose-500">
            {t('auth:sendReset')}
          </button>
        </form>
      )}
      <Link to="/login" className="mt-4 block text-center text-sm text-rose-400">
        {t('auth:backToLogin')}
      </Link>
    </div>
  );
}
