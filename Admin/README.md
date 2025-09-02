# Flan Coffee — Admin

Refactored admin dashboard implemented with Express, MySQL, and a responsive vanilla JS frontend.

Quick setup

1. Copy `.env.example` to `.env` and fill DB credentials and `JWT_SECRET`.

2. Create the database and tables. If you have MySQL locally, run:

```powershell
mysql -u root -p < db/init.sql
```

That creates the `flancoffee` database, `admin` and `products` tables and seeds an `admin` user with password `12345` (the server will migrate this plaintext password to a bcrypt hash on first successful login).

3. Install dependencies and start the app:

```powershell
npm install
node start.js
```

Open http://localhost:5000 — you'll be redirected to the admin login.

Notes
- Server reads configuration from `.env` (see `.env.example`).
- Public assets are in `public/`. API endpoints are under `/api` and are protected by a JWT cookie.

