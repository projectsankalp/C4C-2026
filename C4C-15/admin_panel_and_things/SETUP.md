# Project Setup

This guide covers both stacks in this workspace:
- `backend/` = Express API for the mobile app
- `frontend/ArogyaLinkAI/` = Expo React Native app
- `admin_panel_and_things/backend/` = NestJS + Prisma admin API
- `admin_panel_and_things/frontend/` = Vite React admin web app

Both backends can share the same PostgreSQL server, but the admin backend should use its own PostgreSQL schema so Prisma does not touch the mobile tables.

## Prerequisites

- Node.js installed
- PostgreSQL running locally or reachable over the network
- A database named `trojan_db`

If you are using Docker PostgreSQL, start the container first and make sure the `trojan_db` database exists.

## Folder Layout

```text
TROJAN_PROJECT_SANKALP/
  backend/                     Express API for mobile app
  frontend/ArogyaLinkAI/       Expo mobile app
  admin_panel_and_things/
    backend/                   NestJS + Prisma admin API
    frontend/                  Vite admin web app
    SETUP.md                   This guide
```

## Mobile App Setup

### Mobile Backend

Create `backend/.env` from `backend/.env.example` and set values like:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=trojan_db
JWT_SECRET=change_this_secret
PORT=4000
```

Install dependencies and start the Express server:

```powershell
cd backend
npm install
npm start
```

This starts the mobile backend on `http://localhost:4000`.

The mobile backend does not create or seed any admin user. Admin accounts are managed only through the admin panel backend.

### Mobile Frontend

The Expo app reads its backend URL from `EXPO_PUBLIC_API_URL`.

Create `frontend/ArogyaLinkAI/.env` with a value like:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

If you are testing on a physical phone, replace `localhost` with your computer's LAN IP address.

Install dependencies and start Expo:

```powershell
cd frontend/ArogyaLinkAI
npm install
npm run start
```

You can also use `npx expo start -c` to clear the Expo cache.

## Admin Panel Setup

### Admin Backend

Create `admin_panel_and_things/backend/.env` from `admin_panel_and_things/backend/.env.example` and set:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trojan_db?schema=admin_panel"
JWT_SECRET="dev_secret_change_me"
JWT_EXPIRES_IN="1d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

Install dependencies and run the Prisma/Nest bootstrap once:

```powershell
cd admin_panel_and_things/backend
npm install
npm run setup
```

`npm run setup` does three things:
- generates the Prisma client
- applies existing Prisma migrations to PostgreSQL
- clears old demo data and ensures a bootstrap admin account exists

This path is non-destructive for unrelated tables, and the separate `admin_panel` schema keeps Prisma away from the mobile backend's `patients` table.

Start the admin API with:

```powershell
npm run start:dev
```

This starts the NestJS API on `http://localhost:3000`.

### Admin Frontend

Create `admin_panel_and_things/frontend/.env` from `admin_panel_and_things/frontend/.env.example` and set:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_MOCK=false
```

Install dependencies and start the Vite app:

```powershell
cd admin_panel_and_things/frontend
npm install
npm run dev
```

This starts the admin web app on `http://localhost:5173`.

## Recommended Start Order

1. Start PostgreSQL.
2. Start `backend/` for the mobile API on port `4000`.
3. Start `frontend/ArogyaLinkAI/` for the Expo app.
4. Start `admin_panel_and_things/backend/` for the admin API on port `3000`.
5. Start `admin_panel_and_things/frontend/` for the admin web app.

## Common Problems

- If the mobile app cannot log in or load patients, check `EXPO_PUBLIC_API_URL` in `frontend/ArogyaLinkAI/.env`.
- If you need the admin account, seed it from `admin_panel_and_things/backend` instead of the mobile backend.
- If the admin frontend cannot talk to the admin backend, check `VITE_API_BASE_URL` in `admin_panel_and_things/frontend/.env`.
- If login fails in either backend, confirm the matching `JWT_SECRET` and database settings in that backend's `.env` file.
- If Prisma migrations are not reflected, rerun `npm run setup` in `admin_panel_and_things/backend`.

## Notes

- Keep the admin panel as a web app. Do not convert it to mobile.
- The mobile app and admin panel can share the same PostgreSQL database, but they still run as separate backends.
- If you later connect another app to this system, point it at the correct backend and database for that app.