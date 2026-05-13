import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { parseJwtPayload } from '../lib/jwt';

const schema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format așteptat: AAAA-LL-ZZ')
      .refine((value) => new Date(value).getTime() < Date.now(), {
        message: 'Data nașterii trebuie să fie în trecut',
      }),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Parolele nu coincid', path: ['confirmPassword'] });

type Form = z.infer<typeof schema>;

export function Register() {
  const nav = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (v) => {
    try {
      const { data } = await api.post<{ accessToken: string }>('/api/auth/register', {
        name: v.name,
        email: v.email,
        password: v.password,
        confirmPassword: v.confirmPassword,
        birthDate: v.birthDate,
      });
      const p = parseJwtPayload(data.accessToken);
      const role = (p.role === 'ADMIN' ? 'ADMIN' : 'USER') as 'USER' | 'ADMIN';
      setAuth(data.accessToken, role, v.email);
      toast.success('Cont creat');
      nav('/');
    } catch {
      toast.error('Înregistrare eșuată');
    }
  });

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="mb-4 text-2xl font-bold">Înregistrare</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Nume</label>
          <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" {...register('name')} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Email</label>
          <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" type="email" {...register('email')} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Parolă (min 8)</label>
          <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" type="password" {...register('password')} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Confirmare parolă</label>
          <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" type="password" {...register('confirmPassword')} />
          {formState.errors.confirmPassword && (
            <p className="text-xs text-red-400">{formState.errors.confirmPassword.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Data nașterii</label>
          <input
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            {...register('birthDate')}
          />
          {formState.errors.birthDate && (
            <p className="text-xs text-red-400">{formState.errors.birthDate.message}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">Folosită pentru reducerea de zi de naștere.</p>
        </div>
        <button type="submit" className="w-full rounded bg-rose-600 py-2 font-medium text-white hover:bg-rose-500">
          Creează cont
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Ai cont? <Link className="text-rose-400" to="/login">Login</Link>
      </p>
    </div>
  );
}
