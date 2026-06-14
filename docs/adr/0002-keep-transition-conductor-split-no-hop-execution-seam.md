# Keep the transition-conductor pure-core / React-shell split; no hop-execution seam

## Context

The in-app transition engine spreads across several small modules: a pure
phase-machine reducer (`lib/transition-conductor.ts`), a thin React shell that
drives it (`components/motion/transition-conductor.tsx`), a pure hop planner
(`lib/plan-in-app-transition.ts`), and per-hop choreography (scroll restore +
`data-vt`) that runs inline in the `AppRouteOutlet` layout effect. A reading of
the layout sees "two transition-conductor files" and "inline hop choreography"
and is tempted to merge or wrap them.

## Decision

The pure-reducer / React-shell split stays. The reducer is the deep module — the
phase machine, generation guards, history semantics — behind an internal seam;
the shell only wires timers and router location. We do not merge them, and we do
not introduce a "hop execution" abstraction wrapping plan + scroll + `data-vt`
while `AppRouteOutlet` is its only consumer.

## Why

The split is depth, not duplication: it fails the deletion test in the right
direction — delete the reducer and its complexity reappears across callers — and
it is unit-tested in isolation precisely because it carries no React.
`planInAppTransition` is already the single hop-planning seam. The hop-execution
choreography has exactly one caller; by "one adapter is a hypothetical seam, two
is a real one," wrapping it now would be speculative generality.

## Consequences

Revisit a hop-execution seam only when a second imperative executor genuinely
appears. Until then, architecture passes should not re-suggest merging the
conductor files or extracting a hop wrapper. The scroll-position store in
`lib/route-scroll.ts` is a separate matter — it is getting an LRU bound and a
clear-on-logout hook (a locality fix, not a new seam).
