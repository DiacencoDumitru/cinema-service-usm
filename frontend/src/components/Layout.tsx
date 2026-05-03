import { Link, NavLink, Outlet } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { CineVerseMark } from './CineVerseMark';
import { SocialIcons } from './SocialIcons';

const brandWordmarkClass =
  'inline-block bg-clip-text font-extrabold tracking-tight text-transparent transition-opacity hover:opacity-90 bg-[linear-gradient(127deg,#065f46_0%,#10b981_16%,#2dd4bf_32%,#38bdf8_48%,#818cf8_66%,#c026d3_82%,#f9a8d4_100%)]';

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'relative pb-2 text-sm font-semibold uppercase tracking-wide transition-colors',
    isActive
      ? 'text-slate-100 after:absolute after:bottom-0 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-purple-600'
      : 'text-slate-400 hover:text-rose-400',
  ].join(' ');
}

export function Layout() {
  const { token, role, email, logout } = useAuthStore();

  async function handleLogout() {
    try {
      await api.post('/api/auth/logout');
    } catch {}
    logout();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800 bg-slate-950 font-sans antialiased">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3 text-2xl font-sans"
          >
            <CineVerseMark size={48} className="shrink-0" />
            <span className={brandWordmarkClass}>Aurora Cinema</span>
          </Link>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-4 lg:gap-6">
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-5">
              <NavLink to="/" end className={navClass}>
                Acasă
              </NavLink>
              <NavLink to="/program" className={navClass}>
                Program
              </NavLink>
              <NavLink to="/preturi" className={navClass}>
                Prețuri
              </NavLink>
              <NavLink to="/contact" className={navClass}>
                Contact
              </NavLink>
              <NavLink to="/regulament" className={navClass}>
                Regulament
              </NavLink>
              {token ? (
                <>
                  <NavLink to="/profil" className={navClass}>
                    Profil
                  </NavLink>
                  <NavLink to="/bilete" className={navClass}>
                    Biletele mele
                  </NavLink>
                  {role === 'ADMIN' && (
                    <NavLink to="/admin/movies" className={navClass}>
                      Admin
                    </NavLink>
                  )}
                </>
              ) : null}
            </nav>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {token ? (
                <>
                  <span className="max-w-[200px] truncate text-xs text-slate-500 sm:max-w-xs sm:text-sm">{email}</span>
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-300 underline-offset-4 hover:text-rose-400 hover:underline"
                    onClick={() => void handleLogout()}
                  >
                    Ieșire
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 9v6a2 2 0 0 0 2 2zm6-10V5a2 2 0 1 0-4 0v4"
                      />
                    </svg>
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                  >
                    Înregistrare
                  </Link>
                </>
              )}
              <SocialIcons variant="dark" className="border-l border-slate-700 pl-3 sm:pl-4" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-10 font-sans antialiased text-sm text-slate-400">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-12 lg:gap-8 lg:px-8">
          <div className="space-y-4 lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 text-xl font-sans">
              <CineVerseMark size={48} className="shrink-0" />
              <span className={brandWordmarkClass}>Aurora Cinema</span>
            </Link>
            <p className="font-medium text-slate-200">Aurora Cinema S.R.L.</p>
            <div className="space-y-1">
              <p>bd. Ștefan cel Mare și Sfânt 132</p>
              <p>Tel: +373 22 000 000</p>
              <p>contact@auroracinema.local</p>
            </div>
            <p className="text-xs text-slate-500">© 2026 Toate drepturile rezervate.</p>
            <SocialIcons variant="dark" />
          </div>

          <div className="lg:col-span-3">
            <p className="mb-4 font-bold text-slate-100">Navigare</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="flex flex-col gap-2">
                <Link className="font-semibold text-slate-300 hover:text-rose-400" to="/">
                  Acasă
                </Link>
                <Link className="font-semibold text-slate-300 hover:text-rose-400" to="/program">
                  Program
                </Link>
                <Link className="font-semibold text-slate-300 hover:text-rose-400" to="/regulament">
                  Regulament
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                <Link className="font-semibold text-slate-300 hover:text-rose-400" to="/contact">
                  Contact
                </Link>
                <Link className="font-semibold text-slate-300 hover:text-rose-400" to="/preturi">
                  Prețuri
                </Link>
              </div>
            </div>
            <p className="mt-6 font-bold text-slate-100">Program casă</p>
            <p className="mt-1">Luni–Duminică: 10:00 – 23:30</p>
          </div>

          <div className="lg:col-span-3">
            <p className="mb-4 font-bold text-slate-100">Acceptăm</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-bold tracking-wider text-slate-100 shadow-sm">
                VISA
              </span>
              <span className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-bold tracking-wider text-slate-100 shadow-sm">
                Mastercard
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">Plata cu card bancar la casă și online (unde este disponibil).</p>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-2">
            <p className="mb-1 font-bold text-slate-100">Aplicația mobilă</p>
            <a
              href="#"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-medium text-white transition hover:border-slate-600 hover:bg-slate-700"
            >
              <svg className="h-8 w-8 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span>
                Descarcă de pe <span className="font-bold">App Store</span>
              </span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-medium text-white transition hover:border-slate-600 hover:bg-slate-700"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7-11-7z" />
                </svg>
              </span>
              <span className="uppercase tracking-wide">
                Descarcă de pe <span className="font-bold">Google Play</span>
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
