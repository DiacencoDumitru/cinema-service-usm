import { useTranslation } from 'react-i18next';
import { AuroraPageHeader } from '../components/AuroraPageHeader';

export function Contact() {
  const { t } = useTranslation('static');

  return (
    <AuroraPageHeader title={t('contact.title')} lead={t('contact.lead')} maxWidth="6xl">
      <div className="relative grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-6 text-sm text-slate-300">
          <p>{t('contact.address')}</p>
          <p>{t('contact.phone')}</p>
          <p>{t('contact.email')}</p>
          <p>{t('contact.boxOffice')}</p>
        </div>
        <div className="aspect-video overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/50">
          <iframe
            title={t('contact.title')}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=bd.+%C8%98tefan+cel+Mare+%C8%99i+Sf%C3%A2nt+132,+Chi%C8%99in%C4%83u&output=embed"
          />
        </div>
      </div>
    </AuroraPageHeader>
  );
}
