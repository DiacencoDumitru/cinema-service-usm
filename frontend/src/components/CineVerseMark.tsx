import { useId } from 'react';

type CineVerseMarkProps = {
  size?: number;
  className?: string;
};

const BG = '#0f172a';
const PLAY = '#f8fafc';

const SECTOR_D =
  'M 10.506 4.218 A 13 13 0 0 1 21.494 4.218 L 18.747 10.109 A 6.5 6.5 0 0 0 13.253 10.109 Z';

const SECTOR_ROTATIONS = [0, 60, 120, 180, 240, 300] as const;

export function CineVerseMark({ size = 28, className }: CineVerseMarkProps) {
  const gradId = `mark-aurora-${useId().replace(/:/g, '')}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="2"
          y1="30"
          x2="30"
          y2="2"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="18%" stopColor="#10b981" />
          <stop offset="36%" stopColor="#2dd4bf" />
          <stop offset="52%" stopColor="#38bdf8" />
          <stop offset="68%" stopColor="#818cf8" />
          <stop offset="82%" stopColor="#c026d3" />
          <stop offset="100%" stopColor="#f9a8d4" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill={BG} />
      <g fill={`url(#${gradId})`}>
        {SECTOR_ROTATIONS.map((deg) => (
          <path key={deg} d={SECTOR_D} transform={`rotate(${deg} 16 16)`} />
        ))}
      </g>
      <circle cx="16" cy="16" r="6.5" fill={BG} />
      <path d="M13.5 11.5v9l7.5-4.5-7.5-4.5z" fill={PLAY} />
    </svg>
  );
}
