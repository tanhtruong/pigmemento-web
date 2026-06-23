# Pigmemento — Domain Context

Pigmemento is a dermatology case-practice web app: users diagnose skin-lesion
**Cases** using the ABCDE melanoma rule, sharpening their judgement over repeated
**Attempts**. This glossary fixes the language the modules are named in. It grows
as architectural decisions crystallize — add a term when a module is named after
a concept that isn't here yet.

## Language

### Session & identity

**Session**:
The authenticated session — the live fact of who is signed in — owning the JWT,
the decoded **Identity**, and the token's validity behind one reactive seam.
_Avoid_: auth state, login state, credentials, "the token" (the token is the
storage detail, not the concept).

**Identity**:
The `{ id, name, email }` the **Session** decodes from its token, with no network
call.
_Avoid_: user (overloaded — see **Profile**), current user, principal.

**Profile**:
The full account record fetched from `/me` — name, role, and activity timestamps
— editable by its owner.
_Avoid_: user, account, me.

### Cases & attempts

**Case**:
A single skin-lesion challenge — the lesion image, its clinical context, and the
correct benign/malignant label the learner is trying to recover.
_Avoid_: question, item, card.

**Attempt**:
A learner's answer to a **Case** — the chosen label plus time-to-answer —
submitted to the server, which grades it.
_Avoid_: answer, guess, submission, try.

**Verdict**:
The resolved meaning of an answered **Attempt** — its **outcome** (correct,
incorrect, or skipped), the correct diagnosis, and the teaching that explains it.
It also reads each **Choice** on the board — the chosen card as correct or
incorrect, and (when wrong) the actually-correct card as a reveal — so every
surface paints from one resolved meaning rather than re-deriving it.
_Avoid_: result, grade, score, feedback.

**Drill**:
A timed session of back-to-back **Attempts** on random **Cases**, tracking
running accuracy toward a chosen target count.
_Avoid_: quiz, test, session (bare), practice run.

## Relationships

- A **Session** holds exactly one **Identity**, or none when signed out.
- An **Identity** and a **Profile** describe the same person but differ in source
  and shape: Identity is decoded from the Session token (cheap, partial); Profile
  is fetched from `/me` (authoritative, full).
- A **Case** is answered by an **Attempt**; submitting an **Attempt** yields a
  **Verdict**, whose outcome is one of correct / incorrect / skipped.
- A **Drill** is a session of consecutive **Attempts**; each runs the same
  lifecycle as a standalone Attempt but resolves inline and auto-advances, rather
  than waiting at its Verdict.

## Example dialogue

> **Dev:** "The header greets you by name — does that read from the **Profile**?"
> **Maintainer:** "No — the greeting is **Identity**, straight off the **Session**
> token, so it paints with no fetch. The **Profile** loads only on the account
> screen, where you can edit it."

> **Dev:** "When the drill colours the chosen card red, is that the **Verdict**?"
> **Maintainer:** "The **Verdict** is the meaning — outcome, diagnosis, teaching.
> The red card is one surface _painting_ that Verdict; the full review screen
> paints the same Verdict as a sentence."

## Flagged ambiguities

- "user" named two distinct concepts: the token-derived `getUserFromToken()`
  result (now **Identity**) and `features/profile`'s `User` account record (now
  **Profile**). Resolved — the **Session** exposes an **Identity**; the
  **Profile** is a separate fetched record.
