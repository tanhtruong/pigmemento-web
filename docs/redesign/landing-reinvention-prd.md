# PRD — Landing reinvention: the dermoscopy instrument

**Status:** Draft · **Date:** 2026-06-22 · **Epic:** _TBD (new `PIG-` epic / GitHub issue)_
**Produced from:** a `/grill-me` + `/frontend-design` pass on 2026-06-22.
**Scope:** the public landing only (`/`). The authenticated app (`/app/*`) is **out of scope** and keeps its existing system.

> This document **supersedes the landing-specific portions** of [`SPEC.md`](./SPEC.md) — §4 (palette), §5 (typography), §6 (landing centerpiece), §8 (imagery treatment, additively), and §9 (landing IA / hero copy). All other SPEC.md decisions — the whole app shell, case-attempt flow, progress dashboard, auth, voice principles, locked terms — remain canonical and unchanged. It **builds on** the shipped cinematic landing (PIG-130 → PIG-133), evolving it rather than discarding it.

---

## 0. Relationship to the redesign spec

The landing shipped in PIG-130 → 133 is already bespoke and cinematic, yet the maintainer reads it as "AI-generated" across **all four** layers at once — structure, copy, visual voice, and motion cohesion. The fix is not a tweak; it is a re-authoring with a single point of view. Several SPEC.md decisions are deliberately reversed **for the landing only**. This is consistent with SPEC.md's own landing/app split (§2–3): the two surfaces are permitted distinct personalities.

| Axis                                | SPEC.md (canonical)                          | This PRD (landing only)                                                            | Why                                                                                                         |
| ----------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Accent                              | Single burnt amber `#FF7849`                 | **Melanin palette** + the clinical **blue-white veil** `#7E94A6` as the sole alarm | Amber reads as a generic SaaS accent. Colour sampled from the disease is authored and unfakeable.           |
| Display type                        | Instrument Serif                             | **Fraunces** (variable; italic for Latin taxonomy)                                 | Instrument Serif is the AI-default high-contrast display. Fraunces carries clinical gravity with character. |
| Body / data type                    | Geist Sans / Geist Mono                      | **IBM Plex Sans / IBM Plex Mono**                                                  | Geist is the Vercel/"AI-SaaS" default. Plex reads as an engineered instrument readout.                      |
| Landing centerpiece                 | 2D pinned image → annotations → serif reveal | **Dimensional-dermoscopy** WebGL lesion: interpretive relief + raking light        | The 2D walkthrough is the thing that reads as a stack of blocks. One continuous instrument is the WOW.      |
| Reduced-motion / incapable fallback | Static composed diagram                      | **Crafted 2D scroll** (same beats + interaction, CSS light-sweep)                  | A frozen image abandons the large share of clinicians on phones.                                            |
| Hero                                | Question hero ("Could you spot it?")         | Imperative, clinical-minimal ("Make the call.")                                    | The rhetorical question is a generative fingerprint.                                                        |

**Honoured from SPEC.md, not reversed:** sentence case everywhere; no exclamation marks; `you`, direct; locked terms (Benign / Malignant / Skip, ABCDE features, Dermoscopic); "Educational use only. Not for diagnosis."; raw, ungraded imagery; source credit on every image; GSAP for pinned-scroll scrub only; three.js quarantined to its chunks.

---

## 1. Problem

The landing at `src/app/routes/landing.tsx` is, by the maintainer's own read, generic on every layer despite real engineering investment:

- **Structure** — a recognisable SaaS skeleton (hero → breakdown → four pillars → FAQ → CTA). The bones are what a generator produces.
- **Copy** — LLM-marketing fingerprints: a rhetorical-question hero, the "turns _looks suspicious_ into _I know the pattern_" construction, tidy rule-of-three pillars, em-dashes throughout.
- **Visual voice** — a safe amber-on-graphite "cinematic dark SaaS" theme; tasteful, but a theme rather than a point of view.
- **Motion** — the sections animate independently; the scroll never carries one continuous story.

The audience is clinicians — GPs, dermatology trainees, OSCE candidates — deciding whether this is a serious diagnostic instrument. For them, genericness reads as "another template" and quietly erodes trust before the product earns a hearing.

There is a strong latent asset the current page underuses: the **playable** hero (commit to a diagnosis before the reveal). It is genuinely on-brand for a trainer but sits inside a block instead of being the dramatic spine.

## 2. Solution / direction

Rebuild the landing around **one grounded hero spectacle**: the lesion, examined like a real dermoscopic encounter. Keep the _real_ ISIC photograph (the "real cases, not stock" pitch depends on it) and give it **dimensional dermoscopy** — interpretive surface relief grazed by a raking dermatoscope light, driven by scroll. Everything else stays disciplined so a clinician still reads the page as an instrument, not a toy.

The scroll is **a cinematic act, then a release**. Act I is one unbroken pinned WebGL take where the lesion is omnipresent and camera, light, ABCDE reveals, and the verdict are choreographed _on it_ — never cutting to blocks. At the crux the scroll **holds** and the user must **commit** (Benign / Malignant); their call triggers the verdict as a personal consequence. The pin then releases into a calmer, conventional scroll for the practical content.

The look is **authored from the disease**: a palette sampled from melanin, the blue-white veil as the single alarm colour spent once at the verdict, Fraunces × IBM Plex typography, and a **graticule** measurement reticle as the signature element. Copy is **clinical minimalism** — the spectacle does the emotional work, so the words stay spare and declarative. The entire concept rests on an unproven shader, so **slice 0 is a gated spike** that must prove the effect before any scaffolding is built.

## 3. Experience spine

1. **Full re-author** — structure, copy, visual, motion all in play; the enemy is genericness.
2. **One grounded hero spectacle** — the lesion carries the WOW; everything else restrained.
3. **Dimensional dermoscopy** — the real photo gains interpretive depth + a raking light. Dark ≠ deep: relief is _lit_, never a literal height claim.
4. **Cinematic act, then release** — Act I is one pinned take; then a calmer conventional scroll.
5. **One decisive commitment** — the take holds at the crux; the verdict is the consequence of the user's call. Reuses the existing playable hook.
6. **Clinical minimalism** — spare, declarative copy.
7. **Crafted 2D fallback** — story + interaction universal; only the WebGL spectacle scales to capable desktops.
8. **Shader spike as gated slice 0** — go/no-go before building Act I.

## 4. The lesion spectacle — dimensional dermoscopy

- **Source:** the existing `public/ISIC_0000022.jpg` (Case 001, melanoma, 4:5). Raw and ungraded per SPEC §8. The raking light is an interpretive _relighting_ overlay, **not** a colour grade — the photograph's pigment is untouched.
- **Depth model — the credibility guardrail:** depth is an **interpretive lighting relief**, never a luminance→height map. Naive grayscale displacement would sink the dark melanin core into a crater, which is anatomically backwards and a dermatologist clocks instantly. The relief is derived from a hand-tuned / precomputed normal (or height) field for this one image, decoupled from pigment darkness, so melanin reads as flat-or-raised — never sunken.
- **The light:** a movable raking dermatoscope light grazes across the surface as scroll progresses, revealing micro-relief and making asymmetry / border irregularity legible as a physical quality.
- **WOW target:** "I have never _felt_ a lesion's surface before," at a stable frame rate, while still reading as the real case.

## 5. Act structure & beats

Act I is a single GSAP `ScrollTrigger` pin over the lesion stage (one pin, scrub) — reusing the existing `camera-beats.ts` / `use-scroll-camera-progress.ts` pattern, re-cut to these beats. Light position and graticule state are driven by the **same** scroll-progress ref the camera reads in `useFrame`. Beats remain pure-math and unit-testable without WebGL, as today.

| Beat              | Scroll range | What happens                                                                              |
| ----------------- | ------------ | ----------------------------------------------------------------------------------------- |
| Arrive            | 0.00–0.15    | Wide, dim. The lesion sits under low light. Eyebrow metadata + imperative hero.           |
| Rake in           | 0.15–0.45    | Camera pushes toward 20×; the raking light sweeps; relief emerges.                        |
| Reading           | 0.45–0.62    | The graticule crosshair snaps to each ABCDE feature in turn, with a mm readout.           |
| **Commit (hold)** | 0.62         | **Scroll-progress holds.** The graticule becomes the decision UI: `Benign` / `Malignant`. |
| Verdict           | post-commit  | The user's call resolves into the diagnosis reveal (see §6).                              |
| Release           | 0.62–1.00    | Camera pulls back; the pin releases into the conventional scroll.                         |

Then the **release act** (conventional, grounded, breathes): trust strip → features → who-it's-for → FAQ → CTA → footer — reusing the existing content (`landing-seed-data.tsx`), re-laid-out in the new system and re-voiced.

## 6. Commitment & verdict

- At the **commit** beat the pin does not advance until the user calls it. Choices are the SPEC-locked **`Benign` / `Malignant`** (the binary), as real, keyboard-operable buttons with mono shortcut hints (`B` / `M`). Reuses the playable-case state in `LandingHero`.
- The choice triggers the **verdict**, evolving SPEC §11's reveal sequence:
  - `DIAGNOSIS` eyebrow (IBM Plex Mono).
  - **`Melanoma`** in Fraunces (the specific diagnosis), with italic Latin taxonomy beneath (_melanoma in situ_).
  - A dampened correctness line in the SPEC pattern: incorrect → "You said benign. It's malignant."; correct → "You said malignant. Correct."
  - **The single veil moment:** a hairline note rendered in `#7E94A6` — the one and only use of the alarm colour on the page — e.g. "blue-white veil — the sign you'd act on."
  - A mm stakes caption (IBM Plex Mono), e.g. `Breslow 0.6 mm`.
- **Never prejudge:** the alarm colour appears **only after** the user commits, honouring SPEC §4 ("the UI must never prejudge before the user answers"). The veil grey-blue is also explicitly _not red_, consistent with SPEC's "graphite, never red" malignant indicator.
- **Accessibility:** decision buttons and verdict text live in the DOM, not only in the canvas; fully keyboard-operable; focus visible.

## 7. Visual system (landing-scoped)

All tokens below are **scoped to the landing / `PublicLayout`** (already dark-pinned), not the app. They live in `src/app/index.css` behind a landing scope so the app's amber/Geist/Instrument-Serif system is untouched.

### Palette — sampled from melanin

| Token   | Hex       | Role                                                                                  |
| ------- | --------- | ------------------------------------------------------------------------------------- |
| `field` | `#0B0A09` | Warm near-black ground (specimen in shadow). Replaces SPEC's cool graphite `#0A0A0B`. |
| `bone`  | `#EDE8DF` | Case-file paper; primary text.                                                        |
| `umber` | `#6B4A2F` | Melanin mid-tone.                                                                     |
| `sepia` | `#2E1C12` | Pigment core; depth.                                                                  |
| `veil`  | `#7E94A6` | Blue-white veil — the **single** alarm colour, spent once at the verdict.             |
| `scale` | `#9A958C` | Graticule lines, mm readouts, captions.                                               |

### Typography

| Role           | Face                                | Notes                                                                                                 |
| -------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Display        | **Fraunces** (variable, Google OFL) | Diagnostic words, headlines; **italic** for Latin taxonomy. Replaces Instrument Serif on the landing. |
| Body / UI      | **IBM Plex Sans** (Google OFL)      | Replaces Geist Sans on the landing.                                                                   |
| Data / caption | **IBM Plex Mono** (Google OFL)      | mm values, case IDs, ABCDE letters, metadata eyebrows. Replaces Geist Mono on the landing.            |

Self-host / preload to avoid layout shift; refresh `ScrollTrigger` on font-load (existing pattern in `use-scroll-camera-progress.ts`).

### Signature — the graticule

The single element the page is remembered by: a measurement reticle (crosshair, concentric rings, a calibrated mm scale bar) etched over the lesion, as in a dermatoscope eyepiece. It is **functional, not decorative** — it locks onto each ABCDE coordinate (reuse `pin-layout.ts`) with a real mm readout, stays calibrated to the current magnification, and **becomes the commitment UI** at the hold beat. Structure is encoded as **measurement**, never as `01 / 02 / 03` numbering. Eyebrows are real dermoscopy metadata (`ISIC_0000022 · 20× · polarized`), not invented section numbers.

## 8. Copy (clinical minimalism)

Spare, declarative, consultant-grade. No rhetorical-question hero, no rule-of-three pillars, no "turns X into Y", em-dashes minimised. Obeys all SPEC §14 voice principles and locked terms. Final copy lands in implementation; these are directional:

| Slot          | Direction                                                 |
| ------------- | --------------------------------------------------------- |
| Hero eyebrow  | `ISIC_0000022 · 20× · polarized`                          |
| Hero headline | "Make the call." (imperative, per SPEC §14)               |
| Hero subhead  | "A real dermoscopic case. A few seconds, like in clinic." |
| Verdict       | "Melanoma." / _melanoma in situ_                          |
| Correctness   | "You said benign. It's malignant."                        |
| Veil note     | "Blue-white veil — the sign you'd act on."                |
| Disclaimer    | "Educational use only. Not for diagnosis." (unchanged)    |

## 9. Crafted 2D fallback

The non-capable path (phone, `prefers-reduced-motion`, `prefers-reduced-data`, no WebGL2, or perf-degrade) renders a **crafted scroll — not a frozen image**: same beats, same `Benign` / `Malignant` commitment, same ABCDE reveal and verdict. The raking light becomes a CSS gradient/mask sweep; depth becomes a subtle transform parallax. Reuses `AnnotatedLesionImage` (`src/components/signature/`) as the base layer. Under `prefers-reduced-motion`, beats cross-fade between discrete states instead of scrubbing. This supersedes SPEC §6's "static composed diagram" fallback for the landing.

## 10. Architecture & rollout

- **Static-first, unchanged:** the DOM content layer (lesion image, ABCDE annotations, copy, CTAs, JSON-LD) renders and is indexable without WebGL. The WebGL spectacle is pure progressive enhancement.
- **Capability gates, unchanged:** keep `shouldRender3D` (WebGL2, reduced-motion, reduced-data, isPhone) and the `PerformanceMonitor` degrade-to-static path; once degraded, stay degraded for the session (`src/lib/render-3d/`, `case-stage.tsx`).
- **Three.js quarantine, unchanged:** all new shader / 3D code stays in `three-*` / `r3f-*` chunks; GSAP in `landing-*` / `gsap-*` chunks. `npm run check:bundles` must stay green (`scripts/check-bundles.mjs`, `vite.config.ts`). No `three` / `@react-three/*` import may leak into the app or landing first-paint chunk.
- **Rollout:** build behind a staging route (e.g. `/next`, as in the PIG-130→133 cycle) under `PublicLayout`; cut `/` over only after the slice-0 gate passes and the build is signed off — mirroring the PIG-133 `/next` → `/` migration.
- **Branching:** per SPEC §15, this repo treats `main` as the active release branch; feature branches follow `feat/redesign-NN-<slug>` off `main`.

## 11. Slice 0 — the shader spike (GATED)

The first and only deliverable until it passes. A **throwaway** prototype (scratch route or the `/prototype` flow) rendering `ISIC_0000022` on a plane with:

- a fragment-shader relief grazed by a movable raking light;
- depth as interpretive relighting, decoupled from pigment darkness (dark core must not sink);
- a hand-tuned / precomputed normal field for this single image.

**Go/no-go gate:** does the raking light produce a credible "examining a real lesion surface" reaction at ≥ 60 fps on a mid desktop GPU? If **no**, fall back to a 2.5D parallax/relighting treatment for Act I before committing. No Act I scaffolding is built until **go**.

## 12. User stories

1. As a **prospective clinician**, I want the page to immediately show a real lesion I can examine, so that I trust this is a serious tool, not marketing.
2. As a **trainee**, I want to commit to a diagnosis before the reveal, so that the page tests me rather than just performing.
3. As a **clinician who guessed wrong**, I want the verdict to land as the consequence of my call, so that the lesson is personal and sticks.
4. As a **skeptical dermatologist**, I want the lesion's depth to behave plausibly (dark pigment is not a pit), so that the spectacle never reads as fake.
5. As a **clinician on a phone**, I want a crafted scroll with the same story and the same commit-and-verdict interaction, so that I am not handed a dead image.
6. As a **user with reduced-motion set**, I want beats to cross-fade rather than scrub, so that the page is comfortable and still complete.
7. As a **screen-reader / keyboard user**, I want the lesion content, decision buttons, and verdict in the DOM and operable without a pointer, so that the experience is fully accessible.
8. As a **search engine**, I want copy, ABCDE annotations, and JSON-LD present without executing WebGL, so that the page indexes.
9. As a **clinician on a weak GPU**, I want the page to degrade to the 2D craft path without jank, so that it never stutters.
10. As a **returning visitor**, I want the primary CTA to take me straight into a case, so that I can act on the intent the page built.
11. As a **maintainer**, I want three.js / GSAP kept in their chunks with `check:bundles` green, so that the app and first paint do not regress.
12. As the **product owner**, I want the landing's new voice to honour the locked terms and disclaimer from `SPEC.md`, so that landing and app stay coherent.
13. As a **clinician**, I want the alarm colour to appear only after I answer, so that the page never prejudges the case.
14. As a **visitor on a slow connection**, I want the static content and type to render before fonts and WebGL load, so that I get value immediately and see no layout shift.
15. As an **OSCE candidate**, I want the ABCDE features called out with their measurements during the reading beat, so that I learn the pattern, not just the answer.
16. As a **stakeholder reviewing the spike**, I want an explicit go/no-go on the shader before scaffolding is built, so that we do not commit effort around an effect that does not land.

## 13. Implementation (by area)

### Routing & rollout

- New staging route under `PublicLayout`; `/` cutover gated on slice-0 + sign-off (PIG-133 pattern). Keep `landing.tsx` static content layer intact as the floor.

### Slice 0 — shader spike

- Throwaway route; custom GLSL relief + raking light over `ISIC_0000022`; precomputed normal field; go/no-go gate (§11).

### Act I — pinned take

- One GSAP `ScrollTrigger` pin; re-cut `camera-beats.ts` to the §5 beats; light + graticule driven by the existing scroll-progress ref consumed in `useFrame`; keep beats pure-math + unit tested.

### Commitment & verdict

- Hold scroll-progress at the commit beat; `Benign` / `Malignant` DOM buttons (keyboard, `B`/`M`); choice → verdict sequence (§6); verdict text + correctness in DOM; veil colour used exactly once.

### Crafted 2D fallback

- CSS light-sweep + transform parallax over `AnnotatedLesionImage`; same beats/interaction; reduced-motion cross-fade. No frozen-image dead end.

### Visual system

- Landing-scoped tokens in `index.css` (§7 palette); add Fraunces + IBM Plex Sans/Mono (self-hosted, preloaded), remove Geist/Instrument Serif **from the landing only**; graticule overlay component locking onto `pin-layout.ts` coordinates with mm readouts, doubling as the commit UI.

### Copy

- Re-voice `landing-seed-data.tsx` to clinical minimalism (§8); eyebrows become dermoscopy metadata; keep FAQPage + Organization JSON-LD and the disclaimer.

### Release act

- Re-lay-out trust strip / features / who-it's-for / FAQ / CTA / footer in the grounded system; primary CTA stays "Start a case" via `useAuthEntry`.

## 14. Test

**Modules to test**

- **Beats** (`camera-beats.ts` + new light/graticule beats): pure-math interpolation, no WebGL needed (prior art: existing camera-beats tests).
- **Commit state machine:** hold → choice → verdict transitions, correct/incorrect copy.
- **Capability gating + degrade** (`render-3d/`): each gate forces the 2D path; degrade is sticky for the session.
- **Crafted 2D fallback:** renders fully (story + interaction) with WebGL disabled.
- **Bundle guard:** `npm run check:bundles` green; no three/r3f leak into app or first-paint chunks.
- **A11y:** keyboard-only commit, focus visible, reduced-motion path, verdict text present in DOM.
- **SEO:** content + JSON-LD present without executing the 3D path.

**Manual checklist**

- Desktop WebGL full run (arrive → verdict → release).
- Mobile crafted 2D run.
- `prefers-reduced-motion` and `prefers-reduced-data` paths.
- Throttled-GPU degrade mid-scroll (no jank, sticky static).
- Keyboard-only commitment + verdict.
- Verify the dark melanin core does **not** sink under the raking light.
- Lighthouse / perf budget on first paint; cross-browser WebGL2.

## 15. Out of scope

- **Full WebGL spectacle / wall-to-wall motion** — rejected; breaches the grounded-credibility ceiling.
- **Mobile as a first-class WebGL hero** — rejected on cost/heat/battery; the crafted 2D fallback covers mobile instead.
- **Actual 3D topology / sculpted lesion model / photogrammetry** — rejected; no assets, and it cuts against "real cases". Interpretive relief from the real photo only.
- **Free-exploration dermatoscope** (drag the light yourself) — rejected; fights the controlled pin and risks a gimmick read.
- **Multiple cases in the hero** — Case 001 only this cycle.
- **App-wide visual changes** — the new palette/type is landing-scoped; `/app/*` keeps amber + Geist + Instrument Serif per `SPEC.md`. (Adopting Fraunces app-wide is a possible future decision, not this PRD.)
- **Repositioning for investors / press** — audience stays clinicians (GPs, trainees, OSCE).

## 16. Notes

- **Gate first.** Slice 0 (the shader spike) blocks everything; Act I work does not start until go.
- **Deploy** via staging route; cut `/` over after sign-off (PIG-133 pattern).
- **Relationship to shipped work:** evolves PIG-130 → 133; reuses the camera-beat / scroll-progress / capability-gating / bundle-quarantine architecture wholesale.
- **Dependencies:** Fraunces + IBM Plex are Google OFL (no licensing blocker); `ISIC_0000022` usage already cleared (existing). No new production runtime dependencies anticipated beyond shader code (confirm before adding any helper lib).
- **Coherence debt to track:** two serifs across the product during this cycle (Fraunces on landing, Instrument Serif's one app reveal). Accepted for now; revisit if the app later adopts Fraunces.
- **Next step:** `/to-issues` to slice this into tracer-bullet issues — suggested first slices: `feat/redesign-spike-lesion-shader` (gated), then Act I pin, commit/verdict, crafted 2D fallback, landing visual tokens, re-voiced release act.
