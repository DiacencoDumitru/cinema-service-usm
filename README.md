# CineVerse

Simple fullstack cinema app.

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
