# Kingdom of Cheria — Official Portal

Government portal imported from the **Cheria Blossom Portal** Google Stitch project, with a shared motion system for page transitions, scroll reveals, and micro-interactions.

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| About | `about.html` |
| Ministers | `ministers.html` |
| Registration | `service-registration.html` |
| Citizen Portal | `portal.html` |

## Motion

Shared tokens live in `assets/css/motion.css` and `assets/js/cheria.js`.

- Fast: 150–250ms micro-interactions
- Medium: 300–500ms drawers, modals, nav
- Slow: 500–800ms page and section reveals
- `prefers-reduced-motion` disables animation

## Design

- **Design system:** `design-system.md`
- **Fonts:** Libre Caslon Text, Plus Jakarta Sans
- **Stack:** Tailwind CDN, Material Symbols, Express + Neon (`@neondatabase/serverless`)

## Local preview (API + frontend)

Citizen registration is saved to Neon PostgreSQL through a small Express API that also serves the static site.

1. Copy `.env.example` to `.env` and set `DATABASE_URL` (Neon pooled connection string with `sslmode=require`). Do not commit `.env`.
2. Install dependencies and start the server:

```bash
npm install
npm start
```

3. Open `http://localhost:3000`. The registration form posts to `POST /api/register`.

Environment variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres connection string (required) |
| `PORT` | HTTP port (default `3000`) |

Health check: `GET http://localhost:3000/api/health`

Schema lives in `schema.sql` and is applied automatically on server start. Static-only preview (`npx serve .`) still works for browsing, but registration will not persist unless `npm start` is running.

## Project structure

```
cheria/
├── server.js                  # Express API + static file server
├── db.js                      # Neon client and schema bootstrap
├── schema.sql                 # citizens, regions, services, ministers
├── .env.example               # DATABASE_URL / PORT template
├── index.html
├── about.html
├── ministers.html
├── service-registration.html
├── portal.html
├── assets/css/motion.css
├── assets/js/cheria.js
└── scripts/import-stitch.mjs
```
