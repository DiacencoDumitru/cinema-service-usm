import { useTranslation } from 'react-i18next';

type RuleSection = {
  title: string;
  items?: string[];
  paragraph?: string;
};

export function Rules() {
  const { t } = useTranslation('static');
  const sections = t('rules.sections', { returnObjects: true }) as RuleSection[];

  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white">{t('rules.title')}</h1>
      <p className="lead text-slate-300">{t('rules.lead')}</p>

      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="mt-8 text-xl font-semibold text-white">{section.title}</h2>
          {section.items ? (
            <ul className="text-slate-300">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.paragraph ? <p className="text-slate-300">{section.paragraph}</p> : null}
        </section>
      ))}

      <p className="mt-8 text-sm text-slate-500">{t('rules.footer')}</p>
    </article>
  );
}
