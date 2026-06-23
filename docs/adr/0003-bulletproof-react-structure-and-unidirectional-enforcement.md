# Adopt the bulletproof-react structure and enforce unidirectional module boundaries

## Context

The codebase already resembled [bulletproof-react](https://github.com/alan2207/bulletproof-react)
— feature modules under `src/features`, an `app` layer, a zod `config/env.ts`,
`@/` absolute imports — but the architecture was a _convention_, not a
guarantee. Nothing stopped a shared component from reaching into a feature, a
feature from importing the `app` layer, or one feature from importing another,
and a handful of such crossings had already accumulated. The `lib` folder mixed
two concerns — preconfigured libraries and pure helpers — and there was no
`testing` module despite `msw` being a dependency.

## Decision

Adopt the bulletproof-react structure fully and make its boundary a build-time
rule:

- Enforce a one-way dependency flow **shared → features → app** with
  `import-x/no-restricted-paths` (error). Cross-feature imports are forbidden.
- Give genuinely-shared modules a home in the shared layers: domain types used
  outside a feature move to `src/types`; layouts that compose features move to
  `src/app/layouts`.
- Split `lib` (preconfigured libraries / seams) from `utils` (pure, standalone
  helpers).
- Add a `src/testing` module (test-utils + MSW mocks); gate browser mocking
  behind `VITE_APP_ENABLE_API_MOCKING`.
- Do **not** add `src/stores` — there is no global client store (see below).

## Why

Enforcement is the point. A documented convention drifts; an ESLint error does
not. Making the boundary explicit also forced the right home for the modules
that were violating it (shared domain types, the app-shell layouts) and keeps
features genuinely independent — which is what makes the codebase navigable and
the modules individually testable.

Splitting `lib`/`utils` follows bulletproof's own definition: `utils` is for
pure helpers, `lib` for configured infrastructure, so a module's folder tells
you whether it carries dependencies. Modules coupled to a seam (`motion-tokens`,
`plan-in-app-transition`, both tied to the routing/transition seam) stay in
`lib`; only dependency-free leaves (`cn`, `easing`, `commit-origin`,
`streak-milestone`) moved to `utils`.

We omit `stores` because server state is owned by TanStack Query and the only
cross-cutting client state is the Session (a context over the JWT). An empty
`stores/` would imply a pattern we don't use.

## Consequences

- A new cross-boundary import fails `npm run lint`. The remedy is always to lift
  the shared thing up a layer (to `types` / `components` / `lib` / `utils`) or
  move a feature-composing module into `app` — never to weaken the rule.
- Introducing a global client store later (e.g. Zustand under `src/stores`) is a
  future decision that would supersede this ADR's omission, and would need adding
  to the `no-restricted-paths` shared zone.
- `import-x/order` and the rest of the import-x recommended set were
  deliberately left off, to avoid a repo-wide import reformat.

The structure is mapped in [project-structure.md](../project-structure.md). The
work shipped across GH-189 (relocation to comply), GH-190 (the ESLint rule),
GH-191 (the `lib`/`utils` split), and GH-192 (the `testing`/MSW module).
