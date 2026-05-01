import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import type { Profile } from '../types';

const schema = z.object({ name: z.string().min(1) });
type Form = z.infer<typeof schema>;

export function Profile() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<Profile>('/api/user/profile');
      return data;
    },
  });

  const { register, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    values: q.data ? { name: q.data.name } : { name: '' },
  });

  const mut = useMutation({
    mutationFn: async (body: Form) => {
      const { data } = await api.put<Profile>('/api/user/profile', body);
      return data;
    },
    onSuccess: () => {
      toast.success('Profil actualizat');
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  if (q.isLoading || !q.data) return <p>Se încarcă…</p>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Profil</h1>
      <p className="text-slate-400">{q.data.email}</p>
      <form className="space-y-4" onSubmit={handleSubmit((v) => mut.mutate(v))}>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Nume</label>
          <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" {...register('name')} />
        </div>
        <button type="submit" className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-500">
          Salvează
        </button>
      </form>
    </div>
  );
}
