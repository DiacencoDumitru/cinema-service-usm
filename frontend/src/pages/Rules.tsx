import { useTranslation } from 'react-i18next';
import { AuroraPageHeader } from '../components/AuroraPageHeader';
import { RulesIllustration } from '../components/RulesIllustration';
import {
  RulesIconAge,
  RulesIconFood,
  RulesIconReceipt,
  RulesIconShield,
  RulesIconSilence,
  RulesIconTicket,
} from '../components/RulesIcons';

type RuleIconKey = 'ticket' | 'receipt' | 'age' | 'silence' | 'food' | 'shield';

type RuleSection = {
  icon: RuleIconKey;
  title: string;
  text: string;
};

const ICONS: Record<RuleIconKey, (props: { className?: string }) => JSX.Element> = {
  ticket: RulesIconTicket,
  receipt: RulesIconReceipt,
  age: RulesIconAge,
  silence: RulesIconSilence,
  food: RulesIconFood,
  shield: RulesIconShield,
};

export function Rules() {
  const { t } = useTranslation('static');
  const sections = t('rules.sections', { returnObjects: true }) as RuleSection[];

  return (
    <AuroraPageHeader title={t('rules.title')} lead={t('rules.lead')}>
      <div className="relative mb-8 hidden justify-center sm:flex">
        <RulesIllustration className="h-24 w-full max-w-md opacity-90" />
      </div>

      <ul className="relative grid gap-4 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = ICONS[section.icon] ?? RulesIconTicket;
          return (
            <li
              key={section.title}
              className="group flex gap-4 rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 transition-colors hover:border-emerald-500/25 hover:bg-slate-900/80"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600/30 via-teal-500/20 to-sky-500/25 text-emerald-300 ring-1 ring-emerald-500/20">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-white">{section.title}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{section.text}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="relative mt-8 text-center text-xs text-slate-500">{t('rules.footer')}</p>
    </AuroraPageHeader>
  );
}
