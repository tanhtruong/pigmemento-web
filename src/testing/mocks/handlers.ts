import { http, HttpResponse } from 'msw';

import { env } from '@/config/env';

// env.API_URL may carry a trailing slash (it does in .env); strip it so the
// handler URLs match the single-slash requests axios actually sends.
const api = env.API_URL.replace(/\/+$/, '');

/**
 * Example request handlers — intentionally minimal, a couple of endpoints to
 * prove the wiring. Add real handlers per feature as tests or the offline dev
 * experience need them; unhandled requests pass through (`onUnhandledRequest:
 * 'bypass'`), so the real API stays the default.
 */
export const handlers = [
  http.post(`${api}/auth/login`, async () =>
    HttpResponse.json({ token: 'test.jwt.token' }),
  ),
  http.get(`${api}/cases`, () => HttpResponse.json([])),
];
