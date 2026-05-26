Backend service for authentication (minimal).

Setup
1. Create a PostgreSQL database (example using Docker container name `postgres`):

```powershell
docker exec -it <postgres-container> psql -U postgres -c "CREATE DATABASE trojan_db;"
```

2. Copy `.env.example` to `.env` inside `backend/` and update values to match your Docker Postgres.

3. Install dependencies and seed the DB:

```powershell
cd backend
npm install
npm run seed
```

This seed only prepares the Express-owned tables. It does not create admin users; the single admin account is seeded from the admin panel backend.

4. Start the backend:

```powershell
npm start
# server listens on PORT (default 4000)
```

Endpoints
- `POST /auth/login` — body `{ "email": "...", "password": "..." }` returns `{ token, email }` on success.

Notes
- This backend only handles authentication and patient data for the mobile app. Admin user creation lives in the admin panel backend.
- Keep changes scoped to `backend/`.
