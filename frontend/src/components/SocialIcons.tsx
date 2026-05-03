import { useId } from 'react';

const SOCIAL = {
  facebook: '#',
  telegram: '#',
  instagram: '#',
  youtube: '#',
  tiktok: '#',
} as const;

type SocialIconsProps = {
  className?: string;
  iconClassName?: string;
  variant?: 'light' | 'dark';
};

export function SocialIcons({ className = '', iconClassName = 'h-9 w-9', variant = 'light' }: SocialIconsProps) {
  const gid = useId().replace(/:/g, '');
  const ring =
    variant === 'dark'
      ? 'flex items-center justify-center rounded-full border border-slate-600 bg-slate-800/90 text-slate-200 shadow-sm transition hover:border-slate-500 hover:bg-slate-700'
      : 'flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className={`${ring} ${iconClassName}`} aria-label="Facebook">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.4H7v3.2h2.4V22h4.1z" />
        </svg>
      </a>
      <a href={SOCIAL.telegram} target="_blank" rel="noopener noreferrer" className={`${ring} ${iconClassName}`} aria-label="Telegram">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21.5 4.5 2.7 11.2s-.3.8.4 1.1l4.7 1.5 1.8 5.5c.1.4.7.5 1 .2l2.2-1.8 4.6 3.4c.4.3 1 .1 1.1-.4l3.2-15.2c.2-.8-.5-1.4-1.2-1.1zM17.9 7.3 8.8 14.1l-.1 3.3-1.1-3.4 10.3-6.7z" />
        </svg>
      </a>
      <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className={`${ring} ${iconClassName}`} aria-label="Instagram">
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <defs>
            <linearGradient id={`ig-${gid}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433" />
              <stop offset="50%" stopColor="#e6683c" />
              <stop offset="100%" stopColor="#bc1888" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#ig-${gid})`}
            d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"
          />
        </svg>
      </a>
      <a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer" className={`${ring} ${iconClassName}`} aria-label="YouTube">
        <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21.6 7.2s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16.2 4 12 4 12 4s-4.2 0-6.7.3c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S2 8.9 2 10.6v1.7c0 1.7.3 3.4.3 3.4s.2 1.4.8 2c.8.8 1.9.8 2.4.9 1.8.2 7.5.3 7.5.3s4.2 0 6.7-.3c.4 0 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.3-1.7.3-3.4v-1.7c0-1.7-.3-3.4-.3-3.4zM10 14.5v-6l5 3-5 3z" />
        </svg>
      </a>
      <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" className={`${ring} ${iconClassName}`} aria-label="TikTok">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M16.6 5.82s.05.92.05 2.22c-1.5-.33-2.95-.15-3.91.87V15.5a3.99 3.99 0 1 1-3.98-4c.07 0 .14.01.21.01v2.02h-.02a2 2 0 1 0 2.05 1.98V1h2.65a4.56 4.56 0 0 0 3 2.82v2z" />
        </svg>
      </a>
    </div>
  );
}
