type IconProps = { className?: string };

export function RulesIconTicket({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2m-1 14H7a2 2 0 01-2-2V10h14v10a2 2 0 01-2 2z" />
      <path strokeLinecap="round" d="M9 14h6" />
    </svg>
  );
}

export function RulesIconReceipt({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l-4 4V4a2 2 0 012-2h10a2 2 0 012 2v14l-4-4H9z" />
      <path strokeLinecap="round" d="M9 10h6M9 7h4" />
    </svg>
  );
}

export function RulesIconAge({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" d="M6 20v-1a6 6 0 0112 0v1" />
      <path strokeLinecap="round" d="M16 6h4M18 4v4" />
    </svg>
  );
}

export function RulesIconSilence({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9v6m4-8v10m4-6v6" />
      <rect x="5" y="3" width="14" height="18" rx="2" />
    </svg>
  );
}

export function RulesIconFood({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v8a4 4 0 008 0V3M12 15v6" />
      <path strokeLinecap="round" d="M9 21h6" />
    </svg>
  );
}

export function RulesIconShield({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
      <path strokeLinecap="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}