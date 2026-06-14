# Per-endpoint `queryOptions` over a Resource factory

## Context

The data layer has ~7 read endpoints (cases, case, latest-attempt, history,
random, profile, stats) whose cache key, fetcher, and response type are split
across `query-keys.ts` and the individual hook files, and only some export
`queryOptions` — so only those are prefetchable by route loaders. The
natural-looking fix is a `createResource()` factory that generates the hook and
the loader options from one descriptor.

## Decision

We do **not** build a Resource/endpoint factory. Each read endpoint exports a
TanStack Query `queryOptions()` (key + fetcher) and derives its `useQuery` hook
from it as a one-liner; route loaders consume the same `queryOptions` via
`ensureQueryData`. Response types are defined once per endpoint. Cache keys stay
centralized in `query-keys.ts` as a single, collision-checkable index.

## Why

A `createResource()` wrapper fails the deletion test: delete it and every call
site falls back to the standard `queryOptions()` + `useQuery()` it already uses
(see `use-case.ts`), so it hides no behaviour — a shallow, pass-through module —
while burying a library every contributor knows behind a bespoke indirection none
do. Uniform `queryOptions` captures the real wins (one definition shared by hook
and loader, every endpoint prefetchable, types defined once) at the library's
grain, with no new abstraction to learn. Keys stay central because the single-file
index makes collisions obvious; per-endpoint colocation would trade that overview
for marginal locality.

## Consequences

Adding an endpoint touches two files by design: the key registry and the
endpoint's `queryOptions`/hook. Future architecture reviews should not re-propose
a generic Resource/endpoint abstraction unless a genuinely _behavioural_ seam
(not merely shared shape) emerges across endpoints.
