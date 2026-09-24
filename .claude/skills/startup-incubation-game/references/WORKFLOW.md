# Workflow Reference

## 1. Recommended working method

Do not start by asking Claude to "build the whole game" from a vague idea.

Use a staged process:

1. lock the game design;
2. simulate runs;
3. decide the smallest MVP;
4. establish the visual target;
5. write the implementation plan;
6. build one vertical slice;
7. test the loop;
8. add event content;
9. balance;
10. deploy.

## 2. When Superpowers is available

Compose this skill with Superpowers rather than duplicating its generic software workflow.

Suggested sequence:

1. Use Superpowers brainstorming to challenge the loop and decisions.
2. Produce or update a concise game design specification.
3. Simulate several complete runs before code.
4. Use Superpowers write-plan to create a small implementation plan.
5. Use the frontend/design workflow for the visual direction.
6. Use Superpowers execute-plan for implementation.
7. Use systematic debugging / tests when issues appear.
8. Use a simplify/refactor pass before deployment.

This skill supplies the project-specific rules. Superpowers supplies the generic engineering discipline.

## 3. Brainstorming questions to resolve before implementation

Only revisit these if they are genuinely unresolved:

- Exactly how many interactive decisions should a run contain?
- Is PMF directly visible as a percentage, or partly hidden?
- How should recurring expenses and founder salaries be simplified?
- What makes the player eligible for fundraising?
- What exact profitability condition counts as a positive ending?
- How rare should the acquisition ending be?
- How much randomness should event outcomes contain?
- Which events must appear every run versus come from a pool?

Avoid reopening decisions already validated by the user unless testing reveals a problem.

## 4. Paper simulation before code

Create 5-10 hypothetical runs using different strategies, for example:

- aggressive hiring;
- cash preservation;
- product/PMF first;
- aggressive growth/marketing;
- corporate sales focus;
- fundraising focus.

For each run record:

- death/success month;
- cash path;
- MRR path;
- PMF path;
- team path;
- key choices;
- ending;
- whether the causal story feels understandable.

Use this to identify obviously dominant strategies.

## 5. First coding milestone

Build a complete but tiny vertical slice before filling the game with content:

- start screen;
- initial state;
- 3-5 representative events;
- metric updates;
- month advance;
- at least one delayed effect;
- one failure state;
- one positive ending;
- recap screen;
- retry.

If that loop is not fun or readable, do not add 30 events yet.

## 6. Visual milestone

Use the bundled La Bataille du Budget screenshots as structural inspiration.

Before polishing all screens, establish:

- page width / main container;
- background and border language;
- typography hierarchy;
- HUD component;
- timeline component;
- event card;
- choice buttons;
- alert/news ticker;
- recap visual style.

Then reuse those patterns consistently.

## 7. Scope protection

If asked to add something complex during MVP implementation, first propose the simplest version that delivers the intended player experience.

Examples:

- leaderboard -> local personal best first;
- accounts -> localStorage first;
- dynamic event editor -> JSON files first;
- AI-generated events -> curated event pool first;
- cloud save -> local save first;
- detailed finance model -> cash, burn, MRR, runway first.

## 8. Definition of done for first public test

The project is ready for a small Learnex test when:

- a new player can start without explanation;
- one run takes <=10 minutes;
- failure feels understandable;
- retry is immediate;
- at least two strategies feel plausible;
- delayed consequences are noticeable;
- the interface resembles a coherent management game;
- there are no obvious dead ends or broken calculations;
- it deploys on a free static host;
- someone can edit event content without changing the engine.
