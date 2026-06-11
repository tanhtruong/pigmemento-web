# Pigmemento redesign spec

Canonical brief for the 12-PR redesign. Every PR in the sequence must conform to this spec; any deviation requires updating this document and noting the change in the PR description.

Produced from a grilling pass on 2026-06-11. Use this as the brief for `/frontend-design` PR1 (Design system foundation) and the reference for all subsequent PRs.

---

## 1. Direction

**Hybrid premium-consumer with clinical credibility from imagery.** Not a typical medical setting — clinical seriousness lives in _content_ (lesion photography + source credits), not in _chrome_.

## 2. Theme strategy

- **Landing: dark-first** (cinematic seduction).
- **App: light-first** (long study sessions, eye strain).
- Both modes implemented and user-toggleable; system preference is the default.

## 3. Personality archetype

- **Landing:** Linear × Vercel × Aesop (calm-precise-editorial).
- **App:** Things 3 × iOS (tactile-considered, spring-physical).

## 4. Palette

- **Accent (single):** burnt amber `#FF7849`-ish. No purple. No secondary celebratory hue — amber does double duty.
- **Dark landing neutrals:** cool graphite / ink — `#0A0A0B` background, `#FAFAF7` text.
- **Light app neutrals:** bone-warm — `#F8F5F0` paper, `#1A1815` ink, cards `#FFFEFB`.
- **Semantic states (dampened):** muted mint for correct, muted coral for incorrect, graphite (never red) for the "malignant" indicator. The UI must never prejudge before the user answers.
- **Borders:** `oklch(1 0 0 / 8%)` dark, `oklch(0 0 0 / 6%)` light.

## 5. Typography

- **Display:** **Instrument Serif** (free, Google, variable) — hero, milestones, diagnosis reveals.
- **Body:** **Geist Sans** (free) — tabular numerals.
- **Data / codes:** **Geist Mono** — case IDs, ABCDE labels, streak counter, source credits.

Serif appears **once** inside the app — the "Diagnosis: …" reveal — making it a meaning-marker rather than decoration.

## 6. Motion

- **Workhorse:** Framer Motion. **GSAP:** pinned-scroll scrub only.
- **House ease:** `cubic-bezier(0.2, 0.8, 0.2, 1)` (already a project token in `motion-tokens`).
- **Landing centerpiece:** pinned-scroll case walkthrough (image → ABCDE annotations animate in → serif diagnosis reveal → teaching point). The single cinematic spend.
- **App micro-moments:**
  - Tap-lift on choice (`stiffness: 350, damping: 28`).
  - Hairline ring fills clockwise around the chosen card (~350ms).
  - Streak number "punches up" with overshoot + decaying amber glow.
  - Shared-element transition case-thumb → case-hero.
  - Page transitions: slide-up + fade (300ms).
- **Reduced motion:** all cinematic motion off; functional transitions instant; centerpiece becomes a static composed diagram with annotations pre-rendered.

## 7. Surfaces

- **Dark landing:** 1–2% SVG film grain overlay, amber radial glow behind hero headline, top-light / bottom-dark inner gradient on cards (Stripe noise-card trick), gradient washes at section transitions.
- **Light app:** 1% paper-warm grain on body, warm-tinted shadows (`0 1px 2px rgba(60,35,0,0.04), 0 6px 24px -8px rgba(60,35,0,0.06)` — never gray-black), barely-there hairlines.
- **Radii:** 14 / 10 / 8 (cards / buttons / inputs).
- **No glass anywhere** except mobile bottom-sheets (vaul, platform convention).

## 8. Photography & lesion imagery

- **Editorial framed** treatment. **No device chrome anywhere.**
- **Hero:** 4:5 portrait dermoscopy image right + Instrument Serif headline left.
- **Centerpiece:** starts 5:4 → eases to full-bleed at climax → returns to 5:4 for diagnosis. _One_ earned full-bleed moment.
- **Case grid:** 1:1 thumbnails, hairline borders, Geist Mono case ID.
- **Case attempt:** image 4:5 mobile / 3:2 desktop, pinned position.
- **Annotations:** 1.5px hairline circles, no fill, thin connector line to **margin-side labels** (Geist Mono letter `A` + Geist Sans clause). Never overlaid arrows or filled badges.
- **Color treatment:** raw, ungraded. Vignette (5–8%) only at the centerpiece climax.
- **Source credit always rendered:** Geist Mono caption beneath every image — `ISIC_0000022 · MELANOMA · COURTESY ISIC ARCHIVE`. Premium products credit their sources.

## 9. Landing IA

1. **Hero** — question hero: _"Could you spot it?"_ + lesion 4:5
2. **Centerpiece** pinned-scroll case walkthrough
3. **Trust strip** — single horizontal band: `2,000+` cases · `ISIC Archive` · Built with dermatologists · Educational use only
4. **Features** — 4 cards
5. **Who-it's-for** mantra band — _"For GPs. For dermatology trainees. For OSCE prep."_
6. **FAQ** accordion (existing 11 questions)
7. **CTA band** — single amber `Start a case`
8. **Minimal footer**

**Cut from current landing:**

- Visible SEO intro → moves to `sr-only` + structured data.
- "How it works" as a separate section → the centerpiece replaces it.
- Stats card-grid → folds into Trust strip.

### Hero copy

| Layer        | Type                                | Content                                                                                                             |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Eyebrow      | Geist Mono caps, amber              | `MELANOMA RECOGNITION · CASE-BY-CASE TRAINING`                                                                      |
| Headline     | Instrument Serif, ~80–96 px desktop | _Could you spot it?_                                                                                                |
| Subhead      | Geist Sans ~18 px                   | _Real dermoscopic cases, scored answers, and the teaching that turns "looks suspicious" into "I know the pattern"._ |
| Primary CTA  | amber filled                        | `Start a case`                                                                                                      |
| Ghost CTA    | text                                | `See how it works` (scrolls to centerpiece)                                                                         |
| Right column | 4:5 dermoscopy                      | + ISIC credit caption                                                                                               |

### Features (4 cards)

1. **Real dermoscopic cases** — Curated from the ISIC Archive, not stock photos.
2. **Feedback that teaches** — Every answer comes with the pattern reasoning, not just right / wrong.
3. **ABCDE-aware** — Annotations call out the features that actually drive the decision.
4. **Respects your time** — 90-second drills. Sessions that fit a coffee break.

## 10. App shell

- **4 surfaces:** Practice · Library · Progress · Profile.

| New surface | Job                                                         | Maps from existing routes                      |
| ----------- | ----------------------------------------------------------- | ---------------------------------------------- |
| Practice    | Start a drill, pick up where you left off, do a random case | `random-attempt`, `case-attempt`, `case-drill` |
| Library     | Browse all cases, filter, search, saved cases               | `cases`                                        |
| Progress    | Streak, stats, history, recent reviews                      | `dashboard`, links into `case-review`          |
| Profile     | Settings, theme, sign out                                   | `profile`                                      |

- **Desktop:** minimal top bar — logo · 4 nav · `⌘K` · streak chip (Geist Mono + flame) · amber `Start a case` · avatar.
- **Mobile:** top bar (logo · `⌘K` · avatar) + bottom tabs (4) + amber FAB on Library / Progress.
- **`⌘K` command palette** (cmdk, already in deps): Start a case · Jump to category · Search · Toggle theme · Sign out · Go to Progress.
- **Start-a-case picker** (cmdk on desktop, vaul sheet on mobile): Random · Drill: Melanoma vs Nevus · Drill: ABCDE · Resume.

## 11. Case-attempt flow

- **Desktop layout:** sticky 3:2 image left, scrolling right column (context + choices + reveal).
- **Mobile layout:** 4:5 image hero + bottom-pinned choices + reveal pulls up as a partial sheet (vaul).
- **Clinical context:** always visible (age · site · clinical note). Not collapsible.
- **Choices:** 3 hairline pill-cards — `Benign` · `Malignant` · `Skip`. Each card carries a Geist Mono shortcut hint (`B` / `M` / `S`). **Tap = commit.** Hairline ring-fill confirms (~350ms).
- **Reveal sequence (~1.6 s):**
  1. Hairline divider draws beneath image (0 ms, 220 ms).
  2. `DIAGNOSIS` eyebrow (Geist Mono, amber ~70%) (150 ms).
  3. **Instrument Serif diagnosis with character-stagger** (300 ms, 24 ms / char, 8 px y-shift).
  4. Dampened correctness indicator + plain copy (550 ms).
  5. Teaching prose (Geist Sans, 700 ms).
  6. ABCDE annotations animate in (900 ms, 180 ms apart) — hairline circles + margin labels.
- **Timer:** hidden during attempt. Shown as quiet caption on review.
- **Keyboard:** `Enter` next · `R` flag · `S` save · `B`/`M`/`S` commit. No auto-advance.
- **Drill mode:** Geist Mono `03 / 12` progress chip + Instrument Serif `Drill complete.` summary screen on completion.

## 12. Progress dashboard

Framing: **study journal, not leaderboard.**

1. **Greeting** — Instrument Serif first-name + Geist Sans suggested-next + two CTAs (amber `Resume drill` · ghost `Start a drill`).
2. **One hero metric** — Geist Mono today count + 14-day amber sparkline. Caption: _"cases today · 31 this week · 142 this month"_. Not three competing rings.
3. **Where you're growing / Where you stumble** _(signature panels)_ — two hairline panels with delta sparklines. Stumble panel has a ghost CTA (`Drill 8 cases on this`).
4. **Recent attempts journal** — 5 rows: thumb · Geist Mono case ID · Geist Sans diagnosis · mint/coral dot · timestamp. Footer link `See all attempts →`.
5. **Calendar heatmap** — 12 weeks, GitHub shape, **amber fills not green**, hairline grid.
6. **Footer line** — Geist Mono total cases · study time · account-since.

**Intentionally absent:** XP, levels, badges, social feed, animated daily-goal ring.

## 13. Auth + small surfaces

- **Auth:** dark single-column centered (continuation of landing voice). Successful sign-in fades through to the light app — the transition is a deliberate moment.
- **Spinner:** hairline-circle slow-pulse (300 ms in · 800 ms hold · 300 ms out). No CSS spin.
- **Skeletons:** hairline outlines + opacity pulse. **No shimmer** (reads 2018-SaaS).
- **Images:** blur-up LQIP → crossfade to full quality.
- **Empty states:** no illustrations, no emoji. Pattern: Instrument Serif headline + 1 Geist Sans line + single CTA.
- **Errors:**
  - Form field: dampened-coral inline text, no shake. _"Email looks off."_
  - API: sonner toast bottom-right, no `!`. _"Couldn't save your attempt. Retrying in 3s."_
  - 404: Instrument Serif `404` + _"This page slipped off the slide."_ + ghost `Back to Practice`.
  - Error boundary: Instrument Serif _"Something went off-pattern."_ + Geist Mono error ID + `Retry` + `Sign out`.
- **Onboarding:** no multi-step tour, no modal carousel. Two inline micro-moments only:
  1. First load → _"Welcome — start your first case."_ + amber CTA.
  2. After first reveal → dismissable tip card _"Diagnoses are revealed after each case. Watch the ABCDE markers — they're the pattern you're learning to see."_

## 14. Voice

### Principles

- Confident, not corporate. No apologizing, no hedging.
- Plain English over jargon — except where the clinical term IS the right word.
- Address: `you`, direct. Never "the clinician" / "users".
- Imperatives for actions: `Start a case`, not "Click here to begin".
- Restrained wit only in three places: **empty states · 404 · drill-complete**. Never in errors or critical states.
- **No exclamation marks anywhere.** Amber-glow animations do the celebrating.
- Sentence case everywhere, including buttons and section titles.
- `We` only for brand POV (about page, footer), never in product copy.

### Voice deltas

- **Landing:** editorial, slightly poetic. Instrument Serif invites it.
- **App:** direct, transactional. Geist Sans carries it.

### Locked terms

Cases · Drills · Attempts · Practice / Library / Progress / Profile · ABCDE features · Benign / Malignant / Skip · Naked-eye / Dermoscopic · Pattern recognition.

### Tagline & disclaimer

- **Tagline:** _"Pattern recognition, case by case."_
- **Disclaimer:** _"Educational use only. Not for diagnosis."_

### Reveal copy patterns

- Correct: _"You were right."_ (or _"You were right. This was a tricky one."_)
- Incorrect: _"You said benign. The answer is malignant."_
- Skipped: _"You skipped this. Worth knowing — here's why."_

## 15. Implementation strategy

### Component strategy

**Layer on shadcn — restyle, don't replace.** Keep Radix primitives (Dialog, Popover, Accordion, Toast — accessibility/keyboard already solved). Restyle via Tailwind v4 CSS variables in `index.css`. Add net-new "signature" components alongside, prefixed:

- `AnnotatedLesionImage`
- `DiagnosisReveal`
- `StreakChip`
- `CenterpiecePinned` (the landing pinned-scroll case walkthrough)
- `ProgressJournal`
- `StartACasePicker`
- `AmberFAB`
- `CalendarHeatmap`

### PR sequence (12, each independently shippable)

| #   | PR                                                                            | Branch                          | Notes                             |
| --- | ----------------------------------------------------------------------------- | ------------------------------- | --------------------------------- |
| 1   | Design system foundation — tokens, fonts, motion, themes, base shadcn restyle | `feat/redesign-01-foundation`   | Foundation for all subsequent PRs |
| 2   | Landing hero + trust strip                                                    | `feat/redesign-02-landing-hero` | Lowest-risk visible win           |
| 3   | App shell — top bar, mobile bottom tabs, `⌘K`, theme switch                   | `feat/redesign-03-app-shell`    | Chrome for all app PRs            |
| 4   | Auth redesign (dark single-column)                                            | `feat/redesign-04-auth`         | Bridge between landing & app      |
| 5   | Case-attempt redesign                                                         | `feat/redesign-05-case-attempt` | Heart of the app                  |
| 6   | Landing centerpiece pinned-scroll walkthrough                                 | `feat/redesign-06-centerpiece`  | Cinematic showstopper             |
| 7   | Case-review + case-drill                                                      | `feat/redesign-07-review-drill` | Builds on PR5                     |
| 8   | Library (cases list, filters, search)                                         | `feat/redesign-08-library`      |                                   |
| 9   | Progress dashboard                                                            | `feat/redesign-09-progress`     |                                   |
| 10  | Rest of landing (features, who-it's-for, FAQ, CTA, footer)                    | `feat/redesign-10-landing-rest` |                                   |
| 11  | Profile, settings, empty-states polish                                        | `feat/redesign-11-profile`      |                                   |
| 12  | A11y audit, perf sweep, reduced-motion verification, lighthouse               | `feat/redesign-12-final-pass`   |                                   |

### Branching & commits

- **Branch off `main`** — pigmemento-web treats `main` as the active release branch.
- Branch names follow `feat/redesign-NN-<slug>`.
- Commits reference GitHub issue / PR numbers per the existing `#NN <imperative>` convention (see `git log`).
- One logical concern per commit. No mixed-purpose commits.
