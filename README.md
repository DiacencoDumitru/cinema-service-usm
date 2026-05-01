# CineVerse

Fullstack cinema web application with movie catalog, schedule, seat booking flow, user auth, and admin management.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind, React Query, Zustand
- Backend: Java 17, Spring Boot, Spring Security, JWT, JPA, Flyway
- Data: PostgreSQL, Redis
- Infra: Docker Compose

## Requirements

- Docker Desktop
- Docker Compose

## Run with Docker

```bash
cd docker
docker compose up --build -d
```

## Open

- Frontend: http://localhost
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

## Main Features

- Public movie listing and details
- Screening schedule by date
- User registration/login with JWT
- Seat selection and booking flow
- Admin management for movies/sessions/bookings

## Stop

```bash
cd docker
docker compose down
```

## Reset database and cache

```bash
cd docker
docker compose down -v
docker compose up --build -d
```

## Default admin user

- Email: `admin@cineverse.local`
- Password: `password`

## Quick Health Checks

- Backend health/docs: open `http://localhost:8080/swagger-ui.html`
- Movies API: `http://localhost:8080/api/movies`
- Prices API: `http://localhost:8080/api/prices`
