import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import type { Profile } from '../types';

const schema = z.object({
  name: z.string().min(1),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format așteptat: AAAA-LL-ZZ')
    .refine((value) => new Date(value).getTime() < Date.now(), {
      message: 'Data nașterii trebuie să fie în trecut',
    }),
});
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

  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    values: q.data ? { name: q.data.name, birthDate: q.data.birthDate ?? '' } : { name: '', birthDate: '' },
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

  if (q.isLoading) return <p>Se încarcă…</p>;
  if (q.isError || !q.data) {
    return (
      <div className="mx-auto max-w-lg space-y-3">
        <p className="text-red-400">Nu am putut încărca profilul.</p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="rounded bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-500"
        >
          Reîncearcă
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Profil</h1>
      <p className="text-slate-400">{q.data.email}</p>
      <form className="space-y-4" onSubmit={handleSubmit((v) => mut.mutate(v))}>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Nume</label>
          <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" {...register('name')} />
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
          <p className="mt-1 text-xs text-slate-500">Necesară pentru reducerea de zi de naștere.</p>
        </div>
        <button type="submit" className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-500">
          Salvează
        </button>
      </form>
    </div>
  );
}
