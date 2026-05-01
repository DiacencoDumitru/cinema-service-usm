import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  role: 'USER' | 'ADMIN' | null;
  email: string | null;
  setAuth: (token: string, role: 'USER' | 'ADMIN', email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      email: null,
      setAuth: (token, role, email) => set({ token, role, email }),
      logout: () => set({ token: null, role: null, email: null }),
    }),
    { name: 'cineverse-auth' },
  ),
);
