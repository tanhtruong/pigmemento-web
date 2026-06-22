# PRD — Landing set-piece: the specimen library

**Status:** Draft · **Date:** 2026-06-23 · **Epic:** _TBD (new `PIG-` epic / GitHub issue)_
**Produced from:** a `/grill-me` + `/frontend-design` pass on 2026-06-23.
**Scope:** the **"Looking, made knowing."** section of the landing (the `ln-method` block in [`src/app/routes/landing.tsx`](../../src/app/routes/landing.tsx)) **+** the trust strip that precedes it (`ln-trust`), which is repurposed as a bridge. The hero, Act, FAQ, and CTA are unchanged except where the shared-context refactor (§9) touches the Act's mounting.

> This document **extends** [`landing-reinvention-prd.md`](./landing-reinvention-prd.md) — it inherits that PRD's visual system (melanin palette, the blue-white veil as the single alarm colour, Fraunces × IBM Plex, the graticule signature) and its build constraints (GSAP/three quarantine, reduced-motion discipline) **unchanged**. It adds a **second cinematic set-piece** where the parent left a static 2×2 grid. Everything in the parent PRD remains canonical.

---

## 0. Relationship to the landing PRD — what's new, what's reused

The shipped landing (PIG-149) has exactly one cinematic moment: **the Act** — one lesion, pinned, raked by a dermatoscope light, vertical depth, ending on the single blue-white verdict. Directly below it, the **"Looking, made knowing."** method section is a flat 2×2 card grid. It is the page's one weak beat, sitting one short scroll under its strongest.

| Axis              | Parent PRD (shipped)           | This PRD (adds)                                     | Why                                                                                  |
| ----------------- | ------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Method section    | Static 2×2 cards (`ln-method`) | **A second WebGL set-piece** — the specimen library | The grid is the last "stack of blocks" beat on a page that is otherwise authored.    |
| Cinematic moments | One (the Act)                  | **Two — a deliberate matched pair**                 | Depth (one lesion) ↔ breadth (many). The contrast is the message; see §12.           |
| WebGL contexts    | One (`<Canvas>` per Act)       | **One shared context for the whole landing**        | Two independent contexts is the mobile failure mode. §9.                             |
| Trust strip       | Flat inline stats line         | **The bridge** between the two set-pieces           | The seam is load-bearing now; the weakest element becomes the connective tissue. §7. |

**Reused unchanged from the parent:** palette and the spend-the-veil-once rule; Fraunces × IBM Plex; the graticule as signature; sentence case; locked terms (Benign / Malignant, ABCDE, Dermoscopic); "Educational use only. Not for diagnosis."; raw ungraded imagery with source credit; GSAP for scroll-scrub only; three.js quarantined to `r3f-*` / `three-*` chunks.

---

## 1. Problem

The four-point method section is the page's flattest beat in its most exposed position:

- **Structurally** it is the canonical SaaS "four pillars" grid — the bones a generator produces — landing one scroll beneath the Act, the page's most authored moment. The drop in conviction is felt.
- **It wastes a real asset.** The maintainer has supplied **24 uniform real ISIC specimens** (1504×1129, ~2 MB total) beyond the hero. Twenty-four real lesions rendered as four text cards is a thesis told instead of shown.
- **The page's pacing now hinges on this seam.** Whatever sits between the Act and whatever follows it sets the rhythm of the whole landing. A flat grid there reads as "the cinematic part is over."

The audience is clinicians deciding whether this is a serious instrument. Volume and method are exactly what earn that trust — and they are precisely what a 2×2 grid cannot convey.

---

## 2. Solution / direction

Replace the grid with a **second set-piece: the specimen library**, built as the Act's deliberate opposite.

Where the Act is **one lesion in depth** — singular, slow, vertical, shaded into relief, ending on the alarm-blue verdict — the library is **many lesions in breadth** — plural, flowing, horizontal, flat-photographic, staying in melanin tones throughout. The two are a **matched pair** (§12): the Act proves _you can read one case_; the library proves _there are thousands, and here is the method that scales across them_.

The mechanic makes "a library you scroll through" literal: **a fixed dermatoscope reticle holds dead-centre while the library slides behind it like a motorised microscope stage.** Four specimens lock under the lens, and each lock-in is where one of the four method-points is _demonstrated_, not asserted.

Core principles carried from the grill:

1. **Matched pair, never an echo** — every differentiation lever in §12 is mandatory, not optional, because two WebGL set-pieces a short scroll apart will collide otherwise.
2. **One climax inside the set-piece** — the ABCDE read (beat 3) is the single peak; the other three beats are crisp, quiet reads. Four equal climaxes is no climax.
3. **Honest over faked** — the climax responds to the real image's pixels; it never places clinical marks a developer can't vouch for (§6, §11).
4. **One WebGL context for the page** — the only safe way to ship WebGL on mobile here (§9).

---

## 3. Experience spine

The page shape becomes **spectacle → bridge → spectacle → settle → convert**:

```
hero (restrained, static)         the calm before
   │
the Act (WebGL)                   ONE lesion · depth · vertical · ends alarm-blue
   │
the bridge (ex-trust strip)       blue drains to black · one verdict → many cases   ← §7
   │
the specimen library (WebGL)      MANY lesions · breadth · horizontal · melanin     ← §4–6
   │
FAQ (quiet accordion)             deliberately plain — the page exhales
   │
CTA                               "Ready to make the call?"
```

Boldness is spent in exactly two places — the two set-pieces — and the bridge that joins them. The hero stays restrained (the calm before three escalating beats); the FAQ and CTA stay quiet on purpose (after two set-pieces, a restful section is the reward, not a missed opportunity).

---

## 4. The mechanic — the specimen stage under the lens

- **The instrument is fixed; the library moves.** A dermatoscope reticle (the graticule signature, reused) is pinned at screen centre. The 24-specimen library is a single horizontal stage that slides behind it. Scroll progress maps to stage travel — scroll down, the stage advances right-to-left through the lens.
- **The lens is real glass.** Specimens refract through the reticle, with depth-of-field softening them as they drift out of the focal centre and a touch of chromatic aberration at the rim. This optical realism is the reason the set-piece is WebGL rather than 2D transforms (§9).
- **Four specimens lock.** At four points along the travel the stage eases to a stop, registering a specimen square under the reticle; the lock is where a beat plays (§5). Between locks the stage flows; non-locked specimens stream as soft, out-of-focus volume.
- **Pin behaviour.** The section pins (GSAP ScrollTrigger, the Act's existing engine) for the duration of the four beats, then releases. Pin length is tuned so each beat gets read-time without the section overstaying.

---

## 5. Beats — enter, then four locks (one climax + three restrained)

The section heading **"Looking, made knowing."** sets once and persists. Scroll then drives:

| Beat          | Method-point | Under the lens                                                                                                                                                                                                                     | Intensity  |
| ------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **0 · enter** | —            | Stage glides in from the right; a dozen specimens stream past, soft with depth-of-field; the reticle idles. Establishes an archive in motion.                                                                                      | ambient    |
| **1**         | **Source**   | First specimen locks; the reticle scans it and its real `ISIC_00000XX · COURTESY ISIC ARCHIVE` provenance types in. → _real cases, not stock._                                                                                     | restrained |
| **2**         | **Feedback** | Next locks; a ✓/✗ chip flashes, then **dissolves into the pattern-reasoning sentence** — literally "teaches, not scores."                                                                                                          | restrained |
| **3**         | **Features** | **The climax.** The lens lifts the lesion's real edges, colour-variance and asymmetry; `A·B·C·D·E` tick into the reticle margin as the lens passes each phenomenon. Real refraction + depth-of-field here. Nothing is pinned. (§6) | **peak**   |
| **4**         | **Format**   | The stage **accelerates** — specimens click past fast, a 90-second dial sweeps and snaps; then the stage releases and the section ends. → _built for clinic time._                                                                 | restrained |

Rhythm is intensity `▂ ▂ █ ▃` across beats 1–4: beat 3 is the one production, the other three are quick crisp reads. This keeps the set-piece itself disciplined and protects the page's overall boldness budget.

---

## 6. The climax — the lens lifts the real pixels

Beat 3 is the set-piece's peak and its one point of genuine technical risk.

- **Image-derived, not authored.** A shader highlights the specimen's actual high-contrast borders, colour variance and asymmetry — computed from the pixels, not from human-placed coordinates. The `A·B·C·D·E` letters appear in the reticle margin as the lens passes each phenomenon; **no letter is pinned to a position on the lesion.**
- **Why this and not pinned ABCDE.** Placing diagnostic marks on a real melanoma is clinical authoring; on an educational-use product, a developer guessing those positions is quietly dishonest. Letting the lens respond to the real image is honest, needs zero clinical authoring, and is a true use of the WebGL we're already paying for. (Decision: stylized / non-clinical — see §11.)
- **Honest copy.** The beat reads **"ABCDE, on the lesion"** / **"Asymmetry, border, colour — lifted off the image, not pinned."** The claim matches exactly what the screen does.
- **Anti-rhyme guard (mandatory).** The Act already runs an image-derived shader (luminance → relief + raking light). The library climax must stay **flat feature-glow / colour shimmer under a lens** — never the Act's dome-and-furrow relief, never a raking light. Same honesty, different optics. See §12.

---

## 7. The bridge — the trust strip becomes the seam

The flat `ln-trust` strip is rebuilt into the deliberate breath between the two set-pieces:

- As the Act's verdict scrolls away, its blue-white veil **cools and drains to warm-black** through one calm line of type.
- The line carries the handoff from **one** to **many**: e.g. _"One verdict. Now the archive — 2,000+ real cases."_ (final copy in §8).
- It is the only place on the page, besides the Act's verdict, where the veil appears — the spend-once rule is preserved; the bridge shows the veil _leaving_, not arriving.

This reframes the page's weakest element as its connective tissue and reinforces the depth→breadth story structurally: the Act's single verdict literally hands off to the library's volume.

---

## 8. Copy (clinical minimalism)

The four method-points keep their meaning but are re-set as terse lock-in reads (the current `METHOD` const bodies are written for static cards). Proposed:

- **Source** — "Real cases." / "Every specimen is a real ISIC case — the image a clinician actually sees, not the textbook ideal."
- **Feedback** — "The read, not the score." / "The pattern behind every call. Never just right or wrong."
- **Features** — "ABCDE, on the lesion." / "Asymmetry, border, colour — lifted off the image, not pinned." _(locked)_
- **Format** — "Built for clinic time." / "Ninety-second reads. A whole session fits a coffee break."

Bridge line — "One verdict. Now the archive — 2,000+ real cases." _(working; tune against the live stat)_

Constraints inherited: sentence case; no exclamation marks; `you`, direct; locked terms; the spectacle does the emotional work, so words stay spare.

---

## 9. Tech & architecture

**Single shared WebGL context for the whole landing.** One renderer hosts both the Act and the library as separate scenes / tracked viewports (drei `<View>`-style, or one `<Canvas>` switching scenes by scroll). There is never a second context to fight — this is what makes "WebGL on mobile" safe.

> ⚠️ **Behavioural change to shipped code (disclosure).** This refactors the Act from its own `<Canvas>` ([`landing-act-stage.tsx`](../../src/components/landing/act-stage/landing-act-stage.tsx)) onto the shared renderer. The Act's _visual output must not change_; only its mounting does. This is the single highest-risk item in the plan and is therefore the **gated slice 0** (§14). Migration consideration: keep the Act's crafted-2D and reduced-motion paths byte-for-byte intact; only the WebGL path moves.

- **Bundle quarantine.** New scene files are named `r3f-library-*`; `three` and `gsap` are pulled through the **same allowlisted paths the Act uses** so `npm run check:bundles` stays green. A second route consumer of `@/lib/lazy-gsap` would split the chunk — the library scene must import `gsap` the way the Act's lazy path already does. (See the landing-redesign build gotchas.)
- **WebGL on mobile.** Per the locked decision, phones get the real WebGL set-piece, touch-tuned — viable only because of the single shared context. Per-tier budgeting rides on top: DPR cap, specimen count, and shader complexity scale down by device capability.
- **Two scenes, never both hot.** On desktop the library scene lazy-mounts only near viewport; the Act's scene is disposed/paused once scrolled well past. With a shared renderer this is scene-swapping, not context-thrashing.
- **Scroll engine.** GSAP ScrollTrigger pin + scrub, reusing the Act's `use-act-scroll` patterns; horizontal stage travel is derived from vertical scroll progress.

---

## 10. Fallbacks & loading

- **Reduced motion** (`prefers-reduced-motion`): a calm static **contact-strip** — a row of specimens, the four points as captions, no scrub, no auto-motion. Mirrors the Act's reduced-motion path.
- **No-WebGL / incapable**: the same crafted static contact-strip stands in (the Act's crafted-2D tier pattern).
- **Image loading**: the 24 specimens load progressively — small derivatives / blurred placeholders first, full-res as each nears the lens. The set-piece must never block first paint; the section lazy-loads like the Act does today.

---

## 11. Content & assets

- **Library**: the 24 ISIC images in `public/isic/` (uniform 4:3, ~2 MB total) + the hero `ISIC_0000022.jpg`. The climax specimen **must not** be the hero (anti-rhyme — the hero is the Act's lesion).
- **Clinical authoring: none** (locked). The climax is stylized/image-derived (§6); no ABCDE coordinates are authored. This was a deliberate call to keep clinical claims off developer-placed marks.
- **Per-beat data (small):** beat 1 needs only the ISIC ID (it is the filename); beat 2 needs one teaching sentence + a benign/malignant truth for its specimen; beat 4 needs nothing. The non-locked ~20 stream as ambient volume — optionally tagged benign/malignant for an authentic mix, otherwise pure texture.
- **Attribution**: every specimen keeps ISIC source credit, per the parent PRD's imagery rule.

---

## 12. Anti-rhyme contract (the matched pair)

Two WebGL set-pieces a short scroll apart **must** be differentiated on every axis below. This is a hard acceptance criterion, not a guideline — if any two start to rhyme, one of them dies.

| Lever           | The Act                        | The library                                                      |
| --------------- | ------------------------------ | ---------------------------------------------------------------- |
| Axis of motion  | Vertical                       | Horizontal                                                       |
| Subject count   | One lesion                     | Many specimens                                                   |
| Image treatment | Relief / dome + furrow         | Flat feature-glow / colour shimmer                               |
| Light           | Raking dermatoscope light      | Lens optics — refraction + depth-of-field                        |
| Colour          | Ends on the alarm-blue verdict | Melanin tones throughout; veil only as it _drains_ in the bridge |
| Emotional arc   | Commit → reveal (tension)      | Browse → recognise (volume)                                      |

---

## 13. User stories

- As a **clinician scanning the page**, after committing to one verdict in the Act I scroll into an archive of real lesions moving under a lens, and I understand _this trains pattern recognition across volume_, not a single trick.
- As a **trainee**, at the climax I watch the lens lift the very features I'm taught to read (asymmetry, border, colour) off a real image, and the method clicks.
- As a **mobile user**, I get the real set-piece, touch-smooth, without my phone stalling.
- As a **motion-sensitive user**, I get a calm static contact-strip that still tells me the four things.

---

## 14. Slice plan — tracer-bullet vertical slices (gate first)

Suggested vertical slices for `/to-issues`. **Slice 0 is gated** — it de-risks the shared-context refactor of shipped code before any library work begins.

- **Slice 0 — shared WebGL context + Act refactor (GATED).** Move the Act onto a shared renderer with **no visual change**; a placeholder second scene mounts in the same context; `check:bundles` green; desktop + mobile perf sanity. **Go/no-go gate** before anything below.
- **Slice 1 — the stage.** On a `/dev/library-act` staging route: the 24 specimens stream horizontally behind a fixed reticle, GSAP scroll-scrub, desktop. The core mechanic, lens still basic.
- **Slice 2 — the lens.** Real refraction + depth-of-field + the image-derived feature-glow climax shader. The visual payoff (the second technical risk after slice 0).
- **Slice 3 — the four beats.** Lock-ins with copy: provenance scan, ✓→teaching dissolve, the ABCDE-margin climax, the acceleration; rhythm one-climax-plus-three-restrained.
- **Slice 4 — the bridge.** Trust strip drains blue→black, one→many handoff line.
- **Slice 5 — fallbacks & budget.** Reduced-motion / no-WebGL static contact-strip, mobile touch tuning, progressive image loading, per-tier perf budgeting.
- **Slice 6 — cutover.** Replace the static `ln-method` grid on `/` with the set-piece; tests; sign-off. Mirrors the PIG-149 staging→`/` cutover.

Staging mirrors the parent: build on `/dev/library-act`, cut `/` over only after the gate passes and the build is signed off.

---

## 15. Test

- **Bundle guard**: `npm run check:bundles` stays green after the shared-context refactor (three/gsap remain in allowed chunks).
- **Act regression**: the Act's WebGL, crafted-2D, and reduced-motion outputs are unchanged after slice 0 (visual diff + existing `landing.test.tsx`).
- **Reduced motion**: with `prefers-reduced-motion`, no scrub mounts; the static contact-strip renders with all four points.
- **Mobile**: the set-piece runs touch-smooth on a mid-range device; one WebGL context only (instrument the renderer count).
- **Content**: every specimen shows ISIC credit; the climax specimen is not the hero.
- **Performance**: first paint is not blocked by the library; images load progressively.

---

## 16. Out of scope

- Any change to the authenticated app (`/app/*`).
- Re-authoring the hero, FAQ, or CTA beyond the trust-strip bridge.
- Authoring clinical ABCDE coordinates (explicitly declined — §11).
- New imagery beyond the supplied `public/isic/` set.

---

## 17. Notes & open risks

- **Gate first.** Slice 0 (shared context + Act refactor) blocks everything. Library work does not start until the Act is proven unchanged on the shared renderer.
- **Two technical unknowns**, in order of risk: (1) the shared-context refactor of shipped code (slice 0), (2) the lens + image-derived glow shader (slice 2). Both are isolated to early slices on the `/dev` route.
- **Anti-rhyme is a release blocker**, not a polish item (§12).
- **Mobile is the long pole.** Real WebGL on phones is the boldest call in this plan; the single shared context is what makes it defensible, and per-tier budgeting is mandatory, not optional.
- **Next step:** `/to-issues` to slice this into tracer-bullet issues — gated `feat/library-shared-context` (slice 0) first, then the stage, the lens, the beats, the bridge, fallbacks, and cutover.
