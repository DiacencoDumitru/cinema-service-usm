import { useTranslation } from 'react-i18next';

export function Contact() {
  const { t } = useTranslation('static');

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="mb-4 text-3xl font-bold">{t('contact.title')}</h1>
        <p className="mb-2">{t('contact.address')}</p>
        <p className="mb-2">{t('contact.phone')}</p>
        <p className="mb-2">{t('contact.email')}</p>
        <p>{t('contact.boxOffice')}</p>
      </div>
      <div className="aspect-video overflow-hidden rounded-xl border border-slate-800">
        <iframe
          title={t('contact.title')}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=bd.+%C8%98tefan+cel+Mare+%C8%99i+Sf%C3%A2nt+132,+Chi%C8%99in%C4%83u&output=embed"
        />
      </div>
    </div>
  );
}
