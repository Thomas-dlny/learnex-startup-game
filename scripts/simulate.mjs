// Simulation d'équilibrage : fait jouer des centaines de parties à plusieurs stratégies-types.
// Usage : npm run simulate            (500 parties par stratégie)
//         npm run simulate -- 2000    (plus de parties)
//
// Lis le tableau ainsi :
//   - "positive" = fins Rentable + Levée + Exit
//   - "mort M" = mois médian de la défaite, pour les parties perdues
// Cibles : aucune stratégie > 70 % de fins positives, le dépensier meurt tôt,
// le prudent ne gagne presque jamais, l'équilibré gagne souvent sans que ce soit garanti.

import { newGame, chooseOption, nextMonth, currentEvent, visibleChoices, runway } from '../src/game/engine.js';
import { endingType } from '../src/game/endings.js';

const RUNS = Number(process.argv[2]) || 500;

const has = (ch, tag) => (ch.tags || []).includes(tag);
const cashCost = (ch) => -Math.min(0, ch.effects?.cash || 0);
const monthlyCost = (ch) => [].concat(ch.effects?.hire || []).reduce((s, h) => s + h.cost, 0) + Math.max(0, ch.effects?.costs || 0);

// Chaque stratégie reçoit l'état et les choix visibles, renvoie un index.
const STRATEGIES = {
  aleatoire: (s, choices, rnd) => Math.floor(rnd() * choices.length),

  depensier: (s, choices) => {
    const i = choices.findIndex((c) => has(c, 'growth') || has(c, 'recruit') || has(c, 'corporate'));
    return i >= 0 ? i : 0;
  },

  prudent: (s, choices) => {
    const i = choices.findIndex((c) => has(c, 'cash'));
    return i >= 0 ? i : choices.length - 1;
  },

  sales: (s, choices) => {
    for (const tag of ['sales', 'growth', 'corporate']) {
      const i = choices.findIndex((c) => has(c, tag));
      if (i >= 0) return i;
    }
    return 0;
  },

  produit: (s, choices) => {
    const i = choices.findIndex((c) => has(c, 'product'));
    return i >= 0 ? i : 0;
  },

  levee: (s, choices) => {
    for (const tag of ['fundraise', 'growth', 'recruit']) {
      const i = choices.findIndex((c) => has(c, tag));
      if (i >= 0) return i;
    }
    return 0;
  },

  // Vend beaucoup, mais seulement après avoir travaillé son PMF.
  sales_pmf: (s, choices) => {
    const affordable = (c) => monthlyCost(c) === 0 || s.mrr >= (s.costs + monthlyCost(c)) * 0.6;
    const order = s.pmf < 40 ? ['product', 'sales', 'cash'] : ['sales', 'growth', 'corporate', 'product'];
    for (const tag of order) {
      const i = choices.findIndex((c) => has(c, tag) && affordable(c));
      if (i >= 0) return i;
    }
    return choices.length - 1;
  },

  // Vise une levée avec de la traction : PMF d'abord, puis préparation et levée.
  levee_traction: (s, choices) => {
    const affordable = (c) => monthlyCost(c) === 0 || s.mrr >= (s.costs + monthlyCost(c)) * 0.6 || s.flags.raised;
    const order = s.pmf < 45 ? ['product', 'fundraise', 'sales', 'cash'] : ['fundraise', 'sales', 'growth', 'product'];
    for (const tag of order) {
      const i = choices.findIndex((c) => has(c, tag) && affordable(c));
      if (i >= 0) return i;
    }
    return choices.length - 1;
  },

  // Choisit toujours l'option qui coûte le plus d'énergie à l'équipe.
  rush: (s, choices) => {
    let worst = 0;
    choices.forEach((c, i) => {
      if ((c.effects?.team || 0) < (choices[worst].effects?.team || 0)) worst = i;
    });
    return worst;
  },

  // Un joueur raisonnable : produit d'abord, surveille son runway, recrute quand les revenus suivent.
  equilibre: (s, choices) => {
    const r = runway(s);
    const score = (c) => {
      let v = 0;
      const burnAfter = s.costs + monthlyCost(c) - s.mrr;
      const runwayAfter = burnAfter <= 0 ? 99 : (s.cash - cashCost(c)) / burnAfter;
      if (runwayAfter < 3) v -= 10;
      if (monthlyCost(c) > 0 && s.mrr < (s.costs + monthlyCost(c)) * 0.5 && !s.flags.raised) v -= 6;
      if (has(c, 'product') && s.pmf < 50) v += 3;
      if (has(c, 'sales') && s.pmf >= 40) v += 3;
      if (has(c, 'fundraise')) v += r < 8 ? 4 : 1;
      if (has(c, 'team') && s.team < 45) v += 4;
      if (has(c, 'growth') && s.pmf >= 45 && r > 6) v += 2;
      if (has(c, 'corporate') && s.pmf >= 40 && s.team > 50) v += 2;
      if (has(c, 'cash') && r < 5) v += 2;
      if (has(c, 'recruit') && s.mrr > 6000) v += 3;
      return v;
    };
    let best = 0;
    choices.forEach((c, i) => {
      if (score(c) > score(choices[best])) best = i;
    });
    return best;
  },
};

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function play(strategy, seed) {
  const rnd = mulberry(seed * 7919);
  let s = newGame(seed);
  let turns = 0;
  while (s.phase !== 'ended' && turns < 60) {
    const choices = visibleChoices(s, currentEvent(s));
    s = chooseOption(s, strategy(s, choices, rnd), undefined);
    s = nextMonth(s);
    turns++;
  }
  return s;
}

const median = (xs) => {
  if (!xs.length) return '-';
  const a = [...xs].sort((x, y) => x - y);
  return a[Math.floor(a.length / 2)];
};
const pct = (n) => `${Math.round((n / RUNS) * 100)}%`.padStart(4);

console.log(`\n${RUNS} parties par stratégie\n`);
console.log('stratégie   positive  rentable levée  exit  debout  mort cash  mort équipe  mort M  MRR fin  events/run');
for (const [name, strat] of Object.entries(STRATEGIES)) {
  const counts = { profitable: 0, funded: 0, exit: 0, survivor: 0, cash: 0, team: 0 };
  const deathMonths = [];
  const mrrs = [];
  const eventIds = new Set();
  let quiet = 0;
  for (let i = 1; i <= RUNS; i++) {
    const s = play(strat, i);
    const type = endingType(s);
    counts[type]++;
    if (type === 'cash' || type === 'team') deathMonths.push(s.month);
    mrrs.push(s.mrr);
    s.history.forEach((h) => eventIds.add(h.eventId));
    quiet += s.history.filter((h) => h.eventId === 'quiet-month').length;
  }
  const positive = counts.profitable + counts.funded + counts.exit;
  console.log(
    [
      name.padEnd(11),
      pct(positive).padStart(8),
      pct(counts.profitable).padStart(9),
      pct(counts.funded).padStart(6),
      pct(counts.exit).padStart(5),
      pct(counts.survivor).padStart(7),
      pct(counts.cash).padStart(10),
      pct(counts.team).padStart(12),
      String(median(deathMonths)).padStart(7),
      String(median(mrrs)).padStart(8),
      `${eventIds.size} ids, ${(quiet / RUNS).toFixed(1)} mois calmes`.padStart(12),
    ].join(' '),
  );
}
console.log('');
