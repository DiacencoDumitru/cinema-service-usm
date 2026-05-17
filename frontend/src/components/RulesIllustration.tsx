/** Decorative cinema seats + screen — Aurora palette */
export function RulesIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="rules-screen" x1="40" y1="8" x2="280" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="rules-seat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <rect x="48" y="12" width="224" height="56" rx="6" fill="url(#rules-screen)" stroke="#10b981" strokeOpacity="0.4" />
      <path
        d="M72 88c0-6 4-10 10-10h8c6 0 10 4 10 10v8H72v-8zm28 0c0-6 4-10 10-10h8c6 0 10 4 10 10v8h-28v-8zm28 0c0-6 4-10 10-10h8c6 0 10 4 10 10v8h-28v-8zm28 0c0-6 4-10 10-10h8c6 0 10 4 10 10v8h-28v-8zm28 0c0-6 4-10 10-10h8c6 0 10 4 10 10v8h-28v-8z"
        fill="url(#rules-seat)"
        stroke="#475569"
        strokeWidth="1"
      />
      <circle cx="160" cy="40" r="12" fill="#10b981" fillOpacity="0.2" stroke="#34d399" strokeOpacity="0.5" />
      <path d="M154 40l4 4 8-8" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
