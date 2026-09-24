---
name: startup-incubation-game
description: "Design and build the EDHEC Entrepreneurs Learnex startup incubation die-and-retry game: gameplay, balancing, events, UX/UI, frontend implementation, testing, and deployment."
---

# Startup Incubation Game

Work on the EDHEC Entrepreneurs Learnex startup game as a deliberately small, fast, replayable educational web game.

## Core principle

Protect the concept from scope creep. Prefer a simple game that is fun and finished over a realistic startup simulator that is complex and unfinished.

The player should understand the interface in under 30 seconds, complete a run in roughly 5 to 10 minutes, fail for understandable reasons, and want to retry immediately.

The target audience knows little or nothing about startups, fundraising, incubation, runway, PMF, MRR, corporate sales, or startup jargon. Teach these concepts through consequences and play rather than long explanations.

## Before doing substantial work

Load the relevant references:

- For product intent, loop, progression, metrics, win/loss states, recap, and pedagogy: read `references/GAME_DESIGN.md`.
- For event logic, delayed consequences, uncertainty, event categories, and example events: read `references/EVENT_SYSTEM.md`.
- For UI/UX and the La Bataille du Budget visual reference: read `references/VISUAL_DIRECTION.md` and inspect the images in `assets/` when visual work is involved.
- For stack, data model, architecture, persistence, hosting, and MVP limits: read `references/TECHNICAL_SCOPE.md`.
- For the recommended process and how to compose with Superpowers: read `references/WORKFLOW.md`.

For a full implementation or major redesign, read all five references first.

## Non-negotiable constraints

1. Keep the MVP frontend-only.
2. Do not add authentication, user accounts, a backend, a database, a CMS, multiplayer, real-time features, analytics infrastructure, or AI-generated events unless the user explicitly asks later.
3. Store game content in data files, ideally JSON, rather than hardcoding every event in components.
4. Keep the number of primary indicators small. The current preferred set is Cash, MRR, Team, and Product-Market Fit, with Runway derived from cash and burn.
5. Use euros for money. The initial cash target is around EUR 10,000.
6. Make cash, burn, and runway understandable to a non-startup audience.
7. Favor 2 or 3 meaningful choices per event.
8. Do not make every effect fully predictable. Some outcomes should be uncertain or delayed.
9. Avoid one universally correct choice. Decisions should depend on the startup's current state.
10. Do not equate startup success with fundraising. Profitability is a valid success path. Fundraising with traction is another. An exit can exist as a rare exceptional ending.
11. A failed run must teach something and make replay attractive.
12. Do not copy La Bataille du Budget literally. Reuse its command-center feel, hierarchy, dark/navy atmosphere, timeline, gauges, framed cards, and event staging while creating an original EDHEC Entrepreneurs startup game.

## Product decision rules

When a proposed feature appears, ask internally:

- Does this make the 5-10 minute loop more fun or understandable?
- Does it teach a useful startup trade-off through play?
- Can it be implemented without adding infrastructure?
- Does it increase replayability rather than merely add detail?

If the answer is mostly no, leave it out of the MVP.

When realism conflicts with clarity, prefer clarity while keeping the economic logic credible.

## Gameplay design rules

Design around a repeated loop:

1. Show the startup state.
2. Present one clear situation or decision.
3. Let the player choose between 2 or 3 options.
4. Apply immediate effects.
5. Queue delayed consequences where appropriate.
6. Advance time.
7. Update cash, burn, runway, traction, team, and PMF.
8. Check failure, progression, and success conditions.
9. Continue until the run ends.
10. Show a useful recap and offer an immediate retry.

A turn can represent roughly one month. The current design target is an 18-month journey, but shorten the number of interactive decision points if needed to preserve a 5-10 minute run.

## Educational design rules

Teach by experience. Examples:

- Recruiting too early increases burn and can kill runway.
- User interviews may cost time and money without immediate revenue, yet improve PMF and future conversion.
- Paid acquisition may increase leads without improving PMF.
- A corporate POC may create revenue and credibility but overload the team or distract from the core market.
- Fundraising buys time but should require some combination of traction, story, market conditions, and preparation.
- A seemingly expensive event such as a trade show can pay off later, or produce nothing.

Use short tooltips or one-sentence explanations for unfamiliar terms when needed. Do not turn the game into a course or glossary.

## Balance philosophy

Aim for "I understand why I died" rather than "I found the mathematically optimal route."

Avoid:

- deterministic +10/-10 optimization everywhere;
- choices where one option dominates;
- random deaths with no causal link;
- impossible first runs;
- a single scripted winning path;
- too many gauges;
- excessive startup jargon;
- long walls of text.

Prefer:

- state-dependent outcomes;
- delayed callbacks to prior choices;
- controlled randomness;
- soft prerequisites;
- multiple viable strategies;
- increasing stakes over time;
- a clear sense of progression.

## Output expectations by task

### If asked to brainstorm or redesign gameplay

Do not code immediately. First clarify or propose:

- core loop;
- primary metrics;
- time structure;
- failure conditions;
- success conditions;
- event categories;
- delayed consequence system;
- recap/retry loop.

Then simulate several runs on paper and identify degenerate strategies before implementation.

### If asked to write events

Use the event schema and principles from `references/EVENT_SYSTEM.md`. Keep copy short and accessible. Make each event reveal a startup trade-off.

### If asked to design the interface

Use `references/VISUAL_DIRECTION.md` and the screenshots in `assets/`. Preserve the visual hierarchy and command-center feeling, but simplify density for first-time startup learners.

### If asked to implement

Use `references/TECHNICAL_SCOPE.md`. Keep components simple, data-driven, and easy to edit. Build the smallest complete vertical slice before adding content.

### If asked to balance

Simulate repeated runs. Track at minimum survival month, ending cash, MRR, burn, PMF, team state, ending type, and major decision history. Adjust systems before manually tuning dozens of individual event numbers.

## Definition of a good MVP

A good MVP has:

- one polished start screen;
- one complete game loop;
- a visible month/timeline progression;
- a small set of readable metrics;
- roughly 15-30 well-designed events with enough variation for replay;
- at least some delayed consequences;
- multiple failure causes;
- at least two positive endings;
- a compelling end-of-run recap;
- local persistence for best run / previous run if useful;
- responsive desktop-first UI that also works acceptably on mobile;
- static deployment on a free host.

It does not need admin tools, accounts, server storage, multiplayer, generated content, or production-scale infrastructure.
