# Technical Scope Reference

## 1. MVP stack

Preferred baseline:

- Vite
- React
- plain CSS or a very light styling approach
- JSON / JS data files for events and game content
- localStorage for run persistence, previous run, best run, and lightweight settings

No backend is required for the MVP.

## 2. Explicitly out of scope for MVP

Do not add without an explicit later request:

- Supabase
- Firebase
- SQL database
- authentication
- user accounts
- server APIs
- multiplayer
- admin dashboard
- headless CMS
- payment system
- generative AI during gameplay
- complex telemetry stack
- microservices

## 3. Hosting

The completed game should be deployable as a static frontend on a free tier such as:

- Netlify
- Vercel
- GitHub Pages

Do not choose infrastructure that prevents simple static hosting.

## 4. Suggested source structure

Keep it understandable to a non-expert maintainer.

Example:

```text
src/
  App.jsx
  game/
    Game.jsx
    gameEngine.js
    initialState.js
  components/
    Header.jsx
    Metrics.jsx
    Timeline.jsx
    EventCard.jsx
    NewsTicker.jsx
    RunRecap.jsx
  data/
    events.json
    delayedEffects.json
  styles/
    app.css
```

This is illustrative, not mandatory. Do not create abstraction layers that are not needed.

## 5. State model

A compact state might contain:

```js
{
  month: 1,
  cash: 10000,
  mrr: 0,
  burn: 1500,
  team: 100,
  pmf: 10,
  clients: 0,
  marketMood: "normal",
  flags: {},
  pendingEffects: [],
  history: []
}
```

Runway can be derived from cash and net burn rather than manually maintained.

Define burn carefully. A useful simplification:

`netBurn = max(operatingCosts - recurringRevenue, 0)`

If the startup becomes cash-flow positive, show "Rentable" or an infinite/positive runway state rather than dividing by zero.

## 6. Event selection

Avoid purely random uniform selection.

Filter by:

- act / month;
- prerequisites;
- flags from previous choices;
- whether an event has already occurred;
- category balancing;
- pending delayed events;
- current state.

Then select among eligible events with controlled randomness.

Important narrative events can be guaranteed or strongly weighted at certain stages.

## 7. Delayed effect engine

Use a simple queue:

```js
pendingEffects: [
  {
    dueMonth: 8,
    effectId: "vivatech-lead-callback",
    sourceEventId: "vivatech-01"
  }
]
```

At the start of a turn, resolve due effects before or alongside a new event.

This mechanism should stay simple and testable.

## 8. Persistence

Use localStorage for:

- current unfinished run, if resume is desired;
- previous run summary;
- best month survived;
- best ending / achievements if later added;
- sound preference if sound is introduced.

Do not store personal data in the MVP.

## 9. Testing priorities

Prioritize game logic tests over exhaustive component tests.

Test:

- cash/runway calculations;
- recurring burn updates;
- delayed event scheduling and resolution;
- event eligibility;
- failure checks;
- success checks;
- localStorage serialization;
- deterministic seeded simulations if a random generator is used.

## 10. Balance simulation

Before hand-tuning dozens of event values, create a lightweight simulation or test harness if useful.

Check questions such as:

- Can a player survive the first six months with several reasonable strategies?
- Is hiring always wrong or always right?
- Is PMF valuable enough to matter?
- Does fundraising happen only when the startup has credible preparation/traction?
- Can profitability be reached without fundraising?
- Are positive endings rare enough to make retry rewarding but common enough to feel achievable?

## 11. Performance and accessibility

The game should load quickly and work without a powerful device.

Use semantic HTML, keyboard-operable choices, adequate contrast, visible focus states, and reduced-motion support for dramatic transitions.

## 12. Content editing

The user should be able to modify event wording and values by editing a data file without changing React components.

Favor readable field names and comments/documentation over clever abstractions.
