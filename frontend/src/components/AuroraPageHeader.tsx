import type { ReactNode } from 'react';

const MAX_WIDTH_CLASS = {
  lg: 'max-w-lg',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
} as const;

function AuroraBanner() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden" aria-hidden>
      <div className="absolute -left-1/4 top-0 h-40 w-[70%] rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="absolute -right-1/4 top-4 h-32 w-[60%] rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute left-1/3 top-6 h-28 w-1/3 rounded-full bg-teal-400/15 blur-3xl" />
    </div>
  );
}

type AuroraPageHeaderProps = {
  title: string;
  lead?: string;
  maxWidth?: keyof typeof MAX_WIDTH_CLASS;
  className?: string;
  children?: ReactNode;
};

export function AuroraPageHeader({
  title,
  lead,
  maxWidth = '4xl',
  className = '',
  children,
}: AuroraPageHeaderProps) {
  return (
    <article className={`relative mx-auto ${MAX_WIDTH_CLASS[maxWidth]} ${className}`}>
      <AuroraBanner />

      <header className="relative z-10 border-b border-slate-800/80 px-5 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        {lead ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{lead}</p>
        ) : null}
      </header>

      {children ? (
        <section className="relative z-10 px-5 pt-6 sm:px-6 sm:pt-8">{children}</section>
      ) : null}
    </article>
  );
}
