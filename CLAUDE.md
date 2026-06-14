# Pigmemento Web — Agent Notes

## Backend access (local dev & verification)

The backend is a **remote** service — there is no local API server to start. The
frontend reads its API base URL from `VITE_APP_API_URL` (in `.env`), which already
points at production: `https://api.pigmemento.app`.

The API's CORS policy allows browser requests from these dev origins:
`http://localhost:5173`, `http://localhost:3000`, `http://localhost:19006` (Expo).
So run the Vite dev server on one of those ports and the browser can call the remote
API directly — no proxy or local backend needed:

```bash
npm run dev -- --port 5173 --strictPort
```

### Previewing auth-gated `/app/*` pages

`/app/*` is guarded by `ProtectedRoute` (`src/lib/auth.tsx`), which requires a valid
JWT in `localStorage.token`. To authenticate during local verification:

1. `POST https://api.pigmemento.app/auth/login` with JSON `{ "email", "password" }`
   → responds `{ "token": "<jwt>" }`.
2. Set it in the browser: `localStorage.setItem('token', '<jwt>')`. The axios client
   (`src/lib/axios.ts`) attaches it as `Authorization: Bearer <jwt>` on every request.

After that, navigating to `/app/cases` (etc.) loads real data from the remote API.

> **Test login credentials live in `CLAUDE.local.md`** (gitignored — never committed,
> since this repo is public). If it's missing, ask the maintainer for the test account.
