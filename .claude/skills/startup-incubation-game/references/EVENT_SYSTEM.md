# Event System Reference

## 1. Event design goal

Every event should create a trade-off that teaches something about building a startup.

Avoid trivia questions and obvious "good answer / bad answer" choices.

## 2. Event anatomy

Recommended data shape:

```json
{
  "id": "corporate-poc-01",
  "act": 2,
  "title": "Un grand groupe veut tester ton produit",
  "category": "sales",
  "description": "Un corporate te propose un POC de trois mois. Potentiel important, mais l'équipe devra ralentir le reste.",
  "conditions": {
    "minMonth": 5,
    "minPmf": 20
  },
  "choices": [
    {
      "label": "Accepter le POC",
      "preview": ["Potentiel de revenu élevé", "Forte charge équipe"],
      "immediate": {
        "cash": 1000,
        "team": -8
      },
      "delayedEffects": [
        {
          "afterTurns": 2,
          "effectId": "corporate-poc-result"
        }
      ]
    },
    {
      "label": "Rester focus",
      "preview": ["Préserve l'équipe", "Pas de revenu immédiat"],
      "immediate": {
        "team": 4,
        "pmf": 3
      }
    }
  ]
}
```

The exact schema can evolve. Keep content separate from rendering logic.

## 3. Choice previews

Do not always reveal exact numerical effects.

Prefer qualitative previews such as:

- Coût élevé
- Potentiel commercial fort
- Risque de distraction
- Améliore la connaissance client
- Charge équipe importante
- Résultat incertain

Exact numbers can be shown when obvious or pedagogically useful, such as a quoted EUR 3,000 booth cost.

If all effects are visible as exact numbers, players will optimize the arithmetic instead of reasoning about startup trade-offs.

## 4. Immediate vs delayed effects

Use both.

### Immediate effects

Examples:

- pay a freelancer;
- receive a client payment;
- increase burn by hiring;
- decrease team health after an intense sprint;
- improve PMF after interviews.

### Delayed effects

Examples:

- a VivaTech lead calls back three months later;
- a rushed hire performs badly later;
- rejecting a custom corporate request preserves roadmap focus and improves later product velocity;
- a grant application pays out after several turns;
- investor preparation improves a later fundraising event;
- ignoring team tension triggers a cofounder departure later.

Delayed callbacks are one of the most important ways to make the game feel causal rather than like isolated cards.

## 5. Controlled randomness

Use randomness for uncertainty, not arbitrary punishment.

A probability can depend on state. Example:

- corporate POC success probability rises with PMF and team health;
- fundraising probability rises with MRR, growth, PMF, market sentiment, and prior investor preparation;
- trade-show ROI rises if the target customer matches the event audience;
- bad hiring risk rises if the player rushed recruitment.

This creates a link between preparation and luck.

## 6. Event categories

Build a balanced pool across categories:

### Product / PMF

- interview 15 users;
- add a requested feature;
- kill a feature;
- pivot to a clearer segment;
- fix onboarding;
- technical debt vs shipping;
- customer churn reveals a product problem.

### Sales

- first paying client;
- discount for an early logo;
- corporate POC;
- custom request from a large client;
- raise prices;
- long procurement cycle;
- client asks for exclusivity;
- channel partnership.

### Marketing / growth

- paid ads;
- content strategy;
- conference / VivaTech;
- PR opportunity;
- viral post;
- poor-quality leads;
- referral program.

### Team

- hire a salesperson;
- hire a developer;
- freelancer vs employee;
- cofounder disagreement;
- burnout warning;
- key person gets another job offer;
- bad hire;
- intern joins;
- role ambiguity.

### Finance

- accountant expense;
- Bpifrance grant;
- bank loan;
- founder salary decision;
- late-paying client;
- VAT / unexpected cash timing;
- raise seed;
- investor term sheet;
- bridge financing.

### Ecosystem / incubation

- EDHEC expert offers help;
- mentor introduction;
- workshop invitation;
- office hours with a specialist;
- intro to a corporate;
- intro to an investor;
- founder peer helps solve a problem.

### Market / external environment

- market becomes cautious;
- sector suddenly becomes fashionable;
- competitor raises a large round;
- new regulation helps or hurts;
- corporate budgets freeze;
- talent market gets expensive;
- acquisition appetite increases.

## 7. Event examples

### Interviews utilisateurs

Choice A: spend two weeks interviewing users.

Possible impact: small cash/time cost, no immediate MRR, PMF increase, unlock better future conversion.

Choice B: keep shipping features.

Possible impact: faster short-term product output, uncertain PMF, potential technical/product debt.

### Meta Ads

Choice A: spend EUR 3,000.

Possible impact: leads and some revenue, but PMF barely moves if targeting/product is weak.

This explicitly teaches that acquisition can mask a weak product-market fit.

### VivaTech

Immediate: booth/travel/team cost.

Delayed branch 2-4 turns later:

- a corporate lead converts;
- an investor intro occurs;
- nothing useful happens.

Probability should depend on preparation and customer fit.

### Corporate POC

Potential: revenue, credibility, strategic relationship.

Cost: team load, custom development, delayed roadmap, concentration risk.

### Recruitment commercial

Upside: greater sales capacity.

Downside: recurring burn; weak PMF can make the hire ineffective.

### Cofounder departure

Should usually be the result of accumulated team stress, unresolved conflict, or an earlier event rather than pure random bad luck.

### Fundraising

Should be a process, not a magic cash button.

Possible prerequisites/boosters:

- enough PMF;
- visible MRR/traction;
- runway not already at zero;
- previous investor preparation;
- reasonable market sentiment;
- team credibility.

### Acquisition offer

Rare. Trigger only after strong traction / strategic relevance. Let the player accept the exit or continue independently if the game design supports it.

## 8. Market sentiment

Consider one hidden or lightly visible global state such as:

- Morose
- Normal
- Euphoric

It can influence fundraising, corporate budgets, hiring costs, and acquisition appetite.

Do not add a dedicated visible gauge unless it helps readability. A news ticker can communicate it narratively.

## 9. Avoid repetitive arithmetic

Events should not all look like:

"Pay EUR 1,000 -> PMF +5"

Use:

- delayed effects;
- prerequisites;
- conditional outcomes;
- probability weighted by current state;
- mutually exclusive opportunity costs;
- recurring burn changes;
- narrative callbacks.

## 10. Initial content target

For a convincing MVP, target roughly 15-30 high-quality events before trying to create 100.

Prioritize variety, causality, and replay value over catalogue size.
