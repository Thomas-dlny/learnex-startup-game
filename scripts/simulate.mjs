// Simulation d'équilibrage : fait jouer des centaines de parties à plusieurs stratégies-types,
// sur chacun des trois parcours.
// Usage : npm run simulate                (400 parties par stratégie et par parcours)
//         npm run simulate -- 2000        (plus de parties)
//         npm run simulate -- 1000 saas   (un seul parcours)
//
// Colonnes :
//   gagne    fins positives (Rentable + Levée + Exit)
//   mort     défaites (cash ou équipe), avec le mois moyen de la mort
//   MRR méd / p90   MRR final médian et du 10e meilleur pourcentage
//   ≥30k     part des parties qui finissent à 30 000 € de MRR ou plus
// Cibles : aucune stratégie dominante, un premier essai (aléatoire) perd souvent,
// 30 000 € de MRR reste rare, chaque parcours a au moins deux stratégies viables.

import { newGame, chooseOption, nextMonth, currentEvent, visibleChoices, runway } from '../src/game/engine.js';
import { endingType } from '../src/game/endings.js';
import { PATH_ORDER } from '../src/data/paths.js';

const RUNS = Number(process.argv[2]) || 400;
const ONLY = process.argv[3];

const has = (ch, tag) => (ch.tags || []).includes(tag);
const cashCost = (ch) => -Math.min(0, ch.effects?.cash || 0);
const monthlyCost = (ch) => [].concat(ch.effects?.hire || []).reduce((s, h) => s + h.cost, 0) + Math.max(0, ch.effects?.costs || 0);
const firstWith = (choices, tags, ok = () => true) => {
  for (const tag of tags) {
    const i = choices.findIndex((c) => has(c, tag) && ok(c));
    if (i >= 0) return i;
  }
  return -1;
};
const or = (i, fallback) => (i >= 0 ? i : fallback);

// Chaque stratégie reçoit l'état et les choix visibles, renvoie un index.
const STRATEGIES = {
  // Un joueur qui découvre et clique un peu au hasard.
  aleatoire: (s, choices, rnd) => Math.floor(rnd() * choices.length),

  // Full sales : vend tout le temps, quel que soit l'état du produit.
  full_sales: (s, choices) => or(firstWith(choices, ['sales', 'growth', 'corporate']), 0),

  // Full product : ne travaille que le produit.
  full_produit: (s, choices) => or(firstWith(choices, ['product']), 0),

  // Gros dépensier : pub, salons, recrutements, grands comptes.
  depensier: (s, choices) => or(firstWith(choices, ['growth', 'recruit', 'corporate']), 0),

  // Ultra prudent : ne dépense rien.
  prudent: (s, choices) => or(firstWith(choices, ['cash']), choices.length - 1),

  // Recrute dès qu'il peut.
  recruteur: (s, choices) => or(firstWith(choices, ['recruit']), or(firstWith(choices, ['product', 'sales']), 0)),

  // Lève dès qu'il peut.
  leveur: (s, choices) => or(firstWith(choices, ['fundraise']), or(firstWith(choices, ['growth', 'recruit']), 0)),

  // Bootstrap : jamais d'investisseurs, recrute seulement si les revenus paient le salaire.
  bootstrap: (s, choices) => {
    const ok = (c) => !has(c, 'fundraise') && (monthlyCost(c) === 0 || s.mrr >= s.costs + monthlyCost(c));
    const order = s.pmf < 40 ? ['product', 'sales', 'cash'] : ['sales', 'product', 'cash', 'team'];
    return or(firstWith(choices, order, ok), or(choices.findIndex(ok), choices.length - 1));
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

function play(strategy, seed, path) {
  const rnd = mulberry(seed * 7919);
  let s = newGame(seed, undefined, { path });
  let turns = 0;
  while (s.phase !== 'ended' && turns < 60) {
    const choices = visibleChoices(s, currentEvent(s));
    s = chooseOption(s, strategy(s, choices, rnd));
    s = nextMonth(s);
    turns++;
  }
  return s;
}

const quantile = (xs, q) => {
  if (!xs.length) return 0;
  const a = [...xs].sort((x, y) => x - y);
  return a[Math.min(a.length - 1, Math.floor(a.length * q))];
};
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const pct = (n, d = RUNS) => `${Math.round((n / d) * 100)}%`;
const k = (n) => (Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n)));

for (const path of PATH_ORDER.filter((p) => !ONLY || p === ONLY)) {
  console.log(`\n=== ${path.toUpperCase()} : ${RUNS} parties par stratégie ===\n`);
  console.log(
    ['stratégie', 'gagne', 'rent.', 'levée', 'exit', 'debout', 'mort', 'mort M', 'cash moy', 'MRR méd', 'MRR p90', '≥30k', 'PMF', 'équipe', 'clients'].map((h, i) => (i === 0 ? h.padEnd(13) : h.padStart(8))).join(''),
  );
  for (const [name, strat] of Object.entries(STRATEGIES)) {
    const counts = { profitable: 0, funded: 0, exit: 0, survivor: 0, cash: 0, team: 0 };
    const deathMonths = [];
    const mrrs = [];
    const cash = [];
    const pmf = [];
    const team = [];
    const clients = [];
    let big = 0;
    for (let i = 1; i <= RUNS; i++) {
      const s = play(strat, i, path);
      const type = endingType(s);
      counts[type]++;
      if (type === 'cash' || type === 'team') deathMonths.push(s.month);
      mrrs.push(s.mrr);
      cash.push(s.cash);
      pmf.push(s.pmf);
      team.push(s.team);
      clients.push(s.clients);
      if (s.mrr >= 30000) big++;
    }
    const positive = counts.profitable + counts.funded + counts.exit;
    const deaths = counts.cash + counts.team;
    console.log(
      [
        name.padEnd(13),
        pct(positive).padStart(8),
        pct(counts.profitable).padStart(8),
        pct(counts.funded).padStart(8),
        pct(counts.exit).padStart(8),
        pct(counts.survivor).padStart(8),
        pct(deaths).padStart(8),
        (deathMonths.length ? avg(deathMonths).toFixed(1) : '-').padStart(8),
        k(avg(cash)).padStart(8),
        k(quantile(mrrs, 0.5)).padStart(8),
        k(quantile(mrrs, 0.9)).padStart(8),
        pct(big).padStart(8),
        avg(pmf).toFixed(0).padStart(8),
        avg(team).toFixed(0).padStart(8),
        avg(clients).toFixed(1).padStart(8),
      ].join(''),
    );
  }
}
console.log('');
