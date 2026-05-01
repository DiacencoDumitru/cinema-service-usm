# CineVerse — practică fullstack

Aplicație web pentru cinematograful fictiv **CineVerse**: program filme, detalii, cont utilizator, rezervare locuri (simulare plată), panou admin.

## Stack

| Layer    | Tehnologii |
|----------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Query, Zustand, React Router, Axios |
| Backend  | Java 17, Spring Boot 3.4, Spring Security, JWT, JPA, Flyway |
| Date     | PostgreSQL, Redis (blocare locuri, blacklist JWT la logout, cache program/filme) |
| API docs | Swagger UI: `/swagger-ui.html` |
| Teste    | Integrare cu Testcontainers (PostgreSQL + Redis); necesită **Docker** local |

## Pornire rapidă (Docker)

Din folderul `docker/`:

```bash
cd docker
docker compose up --build
```

- Frontend: http://localhost (Nginx proxy către `/api` → backend)
- Backend direct: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

Variabile utile (opțional, fișier `.env` lângă `docker-compose.yml`):

- `JWT_SECRET` — secret HMAC pentru JWT (minim recomandat: 32+ octeți aleatori)

### Cont administrator (din seed Flyway)

- **Email:** `admin@cineverse.local`
- **Parolă:** `password`

## Dezvoltare locală (fără Docker pentru app)

1. **PostgreSQL** și **Redis** pornite (porturi implicite 5432 / 6379), bază `cineverse`, user/parolă `cineverse` / `cineverse` (sau setează `DB_*` în mediul Spring).

2. **Backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Proxy Vite trimite `/api` către `http://localhost:8080`.

## Teste integrare

```bash
cd backend
mvn test
```

Testele folosesc Testcontainers. Dacă Docker nu este disponibil, rulează ca **skipped** (`@Testcontainers(disabledWithoutDocker = true)`).

## Structură repo

```
backend/          — Spring Boot API
frontend/       — SPA React (Vite)
docker/         — Dockerfile-uri + docker-compose.yml
```

## API (orientativ)

Paginare cu cursor pentru liste: `cursor`, `limit` (unde este cazul). Filtrare genuri în query: **virgulă** (conform Swagger), ex. `genres=Dramă,SF`.

Endpoint-uri principale: `/api/movies`, `/api/movies/{id}`, `/api/movies/{id}/screenings`, `/api/sessions?date=...`, `/api/sessions/{id}`, `/api/sessions/{id}/seats`, `/api/auth/*`, `/api/user/*`, `/api/bookings`, `/api/bookings/lock`, `/api/prices`, `/api/halls` (admin), `/api/admin/bookings` (admin).

## Bază de date (rezumat)

Tabele: `users`, `movies`, `halls`, `seats`, `screenings`, `bookings`, `booking_seats`, `prices`. Migrări Flyway în `backend/src/main/resources/db/migration/`; seed: 14 filme (7 în derulare + 7 în curând), 3 săli, utilizator admin, seanse pe mai multe zile pentru filmele „în derulare”. Filmele au și `formats` / `languages` (`text[]`, migrarea `V3`).

După **schimbarea** unui script de seed deja numerotat (ex. `V2__seed.sql`), Flyway nu îl reaplică pe un volum existent. Recreează volumul și reconstruiește containerele:

```bash
cd docker
docker compose down -v && docker compose up --build
```

## Postere

Fișierele trebuie plasate în `frontend/public/posters/` cu **exact** aceste nume (`<slug>.jpg`):

- `beast.jpg`
- `diavolul-prada-2.jpg`
- `protector.jpg`
- `michael.jpg`
- `mumia-lee-cronin.jpg`
- `scapa-cine-poate-2.jpg`
- `proiectul-hail-mary.jpg`
- `passenger.jpg`
- `misiune-la-limita.jpg`
- `backrooms.jpg`
- `ziua-adevarului.jpg`
- `supergirl.jpg`
- `billie-eilish-tour.jpg`
- `iron-maiden-burning-ambition.jpg`

În seed, `poster_url` este `/posters/<slug>.jpg`. După `npm run build`, fișierele ajung în `dist/posters/`; în Docker, Nginx din containerul frontend le servește la `http://localhost/posters/<slug>.jpg`.

## Trailere video (Git LFS)

Player-ul de pe pagina principală folosește fișiere `.mp4` locale din `frontend/public/videos/`. URL-ul este derivat din poster: `/posters/<slug>.jpg` → `/videos/<slug>.mp4`. Pentru ca repo-ul să rămână ușor și după `git clone` să primești automat trailerele, fișierele `.mp4` sunt urmărite cu **Git LFS** (vezi `.gitattributes`).

### Instalare git-lfs (o singură dată per mașină)

- macOS: `brew install git-lfs`
- Ubuntu/Debian: `sudo apt install git-lfs`
- Windows: instalator de pe https://git-lfs.com

Apoi:

```bash
git lfs install
```

### După `git clone`

```bash
git lfs install
git lfs pull   # dacă fișierele au venit ca pointer-text de ~130 octeți
```

### Adăugarea unui trailer nou

```bash
cp my-trailer.mp4 frontend/public/videos/<slug>.mp4
git add .gitattributes frontend/public/videos/<slug>.mp4
git commit -m "feat: add trailer for <slug>"
git push
```

Regula din `.gitattributes` (`frontend/public/videos/*.mp4 filter=lfs ...`) trimite automat fișierul în LFS.

### Nume fișiere (pentru filmele NOW_SHOWING)

- `beast.mp4` (poster seed: `/posters/beast.jpg`)
- `diavolul-prada-2.mp4`
- `protector.mp4`
- `michael.mp4`
- `mumia-lee-cronin.mp4`
- `scapa-cine-poate-2.mp4`
- `proiectul-hail-mary.mp4`

Dacă un fișier lipsește (sau LFS nu este instalat), `VideoStage` declanșează `onError` și sare la următorul trailer — pagina nu se blochează, posterele și caruselele nu sunt afectate.

Limite GitHub LFS pe planul gratuit: 1 GB stocare + 1 GB trafic/lună — pentru 7 trailere (~100–200 MB total) este suficient.

Notă: nu folosi link-uri către pagini ale altor site-uri (de ex. `cineplex.md/movie-details/...`) — acelea sunt HTML, nu video, și se pot schimba oricând.
