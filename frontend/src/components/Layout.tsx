import { Link, Outlet } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/authStore';

export function Layout() {
  const { token, role, email, logout } = useAuthStore();

  async function handleLogout() {
    try {
      await api.post('/api/auth/logout');
    } catch {
    }
    logout();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-rose-500">
            CineVerse
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link className="hover:text-rose-400" to="/">
              Acasă
            </Link>
            <Link className="hover:text-rose-400" to="/program">
              Program
            </Link>
            <Link className="hover:text-rose-400" to="/preturi">
              Prețuri
            </Link>
            <Link className="hover:text-rose-400" to="/contact">
              Contact
            </Link>
            <Link className="hover:text-rose-400" to="/regulament">
              Regulament
            </Link>
            {token ? (
              <>
                <Link className="hover:text-rose-400" to="/profil">
                  Profil
                </Link>
                <Link className="hover:text-rose-400" to="/bilete">
                  Biletele mele
                </Link>
                {role === 'ADMIN' && (
                  <Link className="rounded bg-rose-600 px-2 py-1 font-medium text-white hover:bg-rose-500" to="/admin/movies">
                    Admin
                  </Link>
                )}
                <span className="text-slate-500">{email}</span>
                <button type="button" className="text-slate-400 hover:text-white" onClick={() => void handleLogout()}>
                  Ieșire
                </button>
              </>
            ) : (
              <>
                <Link className="hover:text-rose-400" to="/login">
                  Login
                </Link>
                <Link
                  className="rounded bg-rose-600 px-3 py-1 font-medium text-white hover:bg-rose-500"
                  to="/register"
                >
                  Înregistrare
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800 bg-slate-900 py-8 text-sm text-slate-400">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-200">CineVerse Chișinău</p>
            <p>bd. Ștefan cel Mare și Sfânt 132</p>
            <p>Tel: +373 22 000 000</p>
            <p>contact@cineverse.local</p>
          </div>
          <div>
            <p className="font-semibold text-slate-200">Program casă</p>
            <p>Luni–Duminică: 10:00 – 23:30</p>
          </div>
          <div>
            <p className="font-semibold text-slate-200">Social</p>
            <p>Facebook · Instagram · YouTube</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
