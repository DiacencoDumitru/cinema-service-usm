type CineVerseMarkProps = {
  /** Pixel width and height (square). */
  size?: number;
  className?: string;
};

const BG = '#0f172a';
const ACCENT = '#e11d48';
const PLAY = '#f8fafc';

export function CineVerseMark({ size = 28, className }: CineVerseMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <circle cx="16" cy="16" r="15" fill={BG} />
      <path fill={ACCENT} d="M16 16 16 5a11 11 0 0 1 9.53 5.5z" />
      <path fill={ACCENT} d="M16 16 16 5a11 11 0 0 1 9.53 5.5z" transform="rotate(120 16 16)" />
      <path fill={ACCENT} d="M16 16 16 5a11 11 0 0 1 9.53 5.5z" transform="rotate(240 16 16)" />
      <circle cx="16" cy="16" r="5.5" fill={BG} />
      <path d="M13.5 11.5v9l7.5-4.5-7.5-4.5z" fill={PLAY} />
    </svg>
  );
}
