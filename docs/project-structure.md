# Project Structure

This app follows the [bulletproof-react](https://github.com/alan2207/bulletproof-react)
architecture: feature-based modules with a strictly one-way dependency flow that
is **enforced by ESLint**, not just documented. See
[ADR-0003](adr/0003-bulletproof-react-structure-and-unidirectional-enforcement.md)
for the rationale; this file is the map.

## `src/` layout

```
src
├── app          # application layer: providers, router, routes, app-shell layouts
├── assets       # static files (images, fonts)
├── components   # shared components used across features
├── config       # global config + env (config/env.ts, config/paths.ts)
├── features     # feature modules (auth, cases, profile, waitlist)
├── hooks        # shared hooks
├── lib          # reusable, preconfigured libraries & seams (axios, react-query, session, …)
├── testing      # test setup, test-utils, and MSW mocks
├── types        # shared TypeScript types
└── utils        # pure, standalone helper functions
```

## Feature folders

A feature lives in `src/features/<name>` and contains only the folders it needs:

```
src/features/cases
├── api          # endpoint queryOptions + hooks (TanStack Query)
├── components   # components scoped to the feature
├── hooks        # hooks scoped to the feature
├── schemas      # zod schemas for forms/validation (local addition)
├── types        # types scoped to the feature
└── utils        # pure helpers scoped to the feature
```

Not every feature has every folder — `profile` is just `api` + `types`, while
`auth` and `waitlist` add `schemas`.

## Unidirectional architecture

Dependencies flow one way only:

```
shared (components · hooks · lib · types · utils · config)  →  features  →  app
```

- A **feature** may not import another feature, nor the **app** layer.
- **Shared** modules may not import **features** or the **app** layer.
- The **app** layer may import features and shared modules (it sits on top).

This is enforced by `import-x/no-restricted-paths` in `eslint.config.js` as an
**error**. When a boundary gets in your way, the fix is to move the shared thing
to the right layer — never to relax the rule:

- A type or component needed by more than one feature → lift it to `src/types`
  or `src/components`.
- A layout that composes features (the authenticated shell) → it belongs in
  `src/app/layouts`, not shared `components/`.

## `lib` vs `utils`

Both are "shared", but they hold different things:

- **`lib`** — reusable, _preconfigured_ libraries and stateful seams: `axios`,
  `react-query`, the `session`, route loaders/transitions, the GSAP loader, the
  `render-3d/` subsystem, query keys, etc. Anything with configuration, module
  state, or domain-seam behaviour.
- **`utils`** — _pure, standalone_ helpers with no internal dependencies: `cn`,
  `easing`, `commit-origin`, `streak-milestone`.

Rule of thumb: if a helper depends on a `lib` seam it stays in `lib` (e.g.
`motion-tokens` and `plan-in-app-transition` depend on the routing/transition
seam). Only dependency-free leaves live in `utils`.

## Deliberate choices

- **No `src/stores`.** There is no global client-state store. Server state lives
  in TanStack Query (`lib/react-query`); the only cross-cutting client state is
  the authenticated **Session** (`lib/session`, exposed via context). Add a
  `stores/` folder only if a genuine global client store (e.g. Zustand) emerges.
- **Per-feature `schemas/`.** zod schemas are colocated in a `schemas/` folder —
  a small, accepted addition to the bulletproof feature vocabulary.
- **`app/layouts/`.** The authenticated app shell (topbar, avatar menu, command
  palette, dashboard/auth layouts) composes features, so it lives in the app
  layer rather than shared `components/`.

## Testing

`src/testing` holds the shared test surface:

- `setup.ts` — vitest setup (jsdom stubs + the MSW server lifecycle).
- `test-utils.tsx` — a custom `render`/`renderHook` that wraps the app providers
  (a fresh `QueryClient`, Helmet, theme, memory router) and re-exports the
  `@testing-library/react` API.
- `mocks/` — MSW `server` (node/vitest) and `worker` (browser) over a shared
  `handlers` set. Browser mocking is opt-in via `VITE_APP_ENABLE_API_MOCKING`.

See also: [`CONTEXT.md`](../CONTEXT.md) for the domain glossary, and
[`docs/adr/`](adr/) for architecture decisions.
