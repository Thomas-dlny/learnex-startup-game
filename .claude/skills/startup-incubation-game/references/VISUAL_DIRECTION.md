# Visual Direction Reference

## 1. Main reference

The visual inspiration is the web game "La Bataille du Budget".

Inspect these bundled screenshots when designing or implementing UI:

- `../assets/bataille-budget-home.png`
- `../assets/bataille-budget-game.png`

The goal is not a pixel-for-pixel clone. Reinterpret its strengths for an EDHEC Entrepreneurs startup simulation.

## 2. What to preserve from the reference

- deep navy / near-black background;
- warm gold accents for framing and important actions;
- a command-center / management-game feeling;
- strong top-level HUD with persistent resources;
- visible episode/month progression;
- central narrative panel for the current event;
- framed cards and clear sections;
- occasional character/avatar interventions;
- a news/live ticker that makes the surrounding world feel active;
- visual staging for major moments.

## 3. What to simplify

The target audience is unfamiliar with startups, so the screen must be more immediately readable than La Bataille du Budget.

Avoid:

- too many simultaneous controls;
- dense policy-style tables;
- tiny text;
- ten separate gauges;
- long instructions before play;
- too many nested panels.

The player should know within seconds:

1. what month they are in;
2. how much cash/runway they have;
3. how the business/team is doing;
4. what decision they need to make now.

## 4. Suggested main game layout

### Header / timeline

Show:

- game title / EDHEC Entrepreneurs identity;
- current month, e.g. `MOIS 5 / 18`;
- timeline of previous/current/upcoming months or chapters.

The timeline can use short labels or icons, with locked future stages.

### Metric HUD

Primary metrics in one readable row:

- Cash: EUR value
- Runway: months
- MRR: EUR value
- Team: 0-100 or visual bar

PMF can either join this row or be shown prominently nearby depending on visual density. If all five values are too much, merge the presentation while retaining the underlying state.

### News ticker

A thin colored strip for ecosystem/market context, e.g.:

`ACTU: Les investisseurs Seed deviennent plus prudents. Les tours prennent plus de temps.`

Use sparingly. It should create atmosphere and explain global modifiers.

### Main event card

Use one dominant panel with:

- event type / character;
- short headline;
- 2-4 sentence description maximum;
- 2 or 3 large choices;
- qualitative consequence hints;
- optional small contextual note explaining a startup term.

### Feedback

After a choice, show concise consequence feedback before advancing. Major delayed callbacks can interrupt with a more dramatic panel.

## 5. Major event staging

Important events should visually break the normal rhythm.

Examples:

`FLASH: TON ASSOCIÉ VEUT QUITTER LA BOÎTE`

`BREAKING: TU REÇOIS UNE TERM SHEET`

`ALERTE RUNWAY: IL TE RESTE 2 MOIS DE TRÉSORERIE`

Use stronger typography, borders, or full-width panels. Do not overuse this or it loses impact.

## 6. Start screen

Inspired by the reference start screen:

- centered contained panel;
- short game premise;
- four compact explainer cards at most;
- one obvious start CTA;
- optional resume run if local storage contains a game;
- optional personal best / achievements later.

Explain only what is needed to start. Teach the rest in play.

Possible concise intro:

"Tu démarres ton incubation chez EDHEC Entrepreneurs avec 10 000 EUR, un MVP et beaucoup de questions. Ton objectif: survivre 18 mois et construire une startup viable."

## 7. End screen

Keep the same visual language but make the recap feel like a run report:

- ending headline;
- months survived;
- key stats;
- small timeline of pivotal decisions;
- cause of failure/success;
- player archetype;
- previous/best run comparison;
- dominant retry button.

## 8. Color and branding

Reference direction:

- deep navy foundation;
- off-white text;
- gold / warm yellow for framing and key CTAs;
- functional accent colors for success, danger, PMF, and team only when needed.

Do not turn the interface into a corporate EDHEC website. It should feel like a game first and an EDHEC Entrepreneurs experience second.

Use EDHEC Entrepreneurs naming/logo only if assets and usage rights are provided.

## 9. Typography

Use strong hierarchy and readable sizes. A slightly editorial or management-game display font can work for titles, paired with a clean sans-serif for body text.

Avoid ornamental typefaces that hurt readability.

## 10. Responsive behavior

Desktop-first is acceptable for Learnex, but the interface should not break on mobile.

On small screens:

- stack metric cards;
- horizontally scroll or simplify the timeline;
- keep choice buttons full-width;
- preserve the event card as the focal point.
