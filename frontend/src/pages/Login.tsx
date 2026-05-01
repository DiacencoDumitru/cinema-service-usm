import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { parseJwtPayload } from '../lib/jwt';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type Form = z.infer<typeof schema>;

export function Login() {
  const nav = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (v) => {
    try {
      const { data } = await api.post<{ accessToken: string }>('/api/auth/login', v);
      const p = parseJwtPayload(data.accessToken);
      const role = (p.role === 'ADMIN' ? 'ADMIN' : 'USER') as 'USER' | 'ADMIN';
      setAuth(data.accessToken, role, v.email);
      toast.success('Autentificare reușită');
      nav('/');
    } catch {
      toast.error('Email sau parolă incorectă');
    }
  });

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Email</label>
          <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" type="email" {...register('email')} />
          {formState.errors.email && <p className="text-xs text-red-400">{formState.errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Parolă</label>
          <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" type="password" {...register('password')} />
        </div>
        <button type="submit" className="w-full rounded bg-rose-600 py-2 font-medium text-white hover:bg-rose-500">
          Intră
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Nu ai cont? <Link className="text-rose-400" to="/register">Înregistrare</Link>
      </p>
    </div>
  );
}
