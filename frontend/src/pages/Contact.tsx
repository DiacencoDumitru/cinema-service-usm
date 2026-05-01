export function Contact() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="mb-4 text-3xl font-bold">Contact</h1>
        <p className="mb-2">Adresă: bd. Ștefan cel Mare și Sfânt 132, Chișinău</p>
        <p className="mb-2">Telefon: +373 22 000 000</p>
        <p className="mb-2">Email: contact@cineverse.local</p>
        <p>Casa bilete: zilnic 10:00 – 23:30</p>
      </div>
      <div className="aspect-video overflow-hidden rounded-xl border border-slate-800">
        <iframe
          title="hartă"
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=bd.+%C8%98tefan+cel+Mare+%C8%99i+Sf%C3%A2nt+132,+Chi%C8%99in%C4%83u&output=embed"
        />
      </div>
    </div>
  );
}
