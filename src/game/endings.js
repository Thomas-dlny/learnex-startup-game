// Fins de partie, cause principale, points forts et profil du joueur.
// Les textes sont ici pour rester modifiables sans toucher aux composants.

import { CONFIG } from './config.js';

export const ENDINGS = {
  exit: { kicker: 'EXIT', title: 'Ta startup est rachetée', positive: true, rare: true },
  profitable: { kicker: 'RENTABLE', title: 'Ta startup vit de ses revenus', positive: true },
  funded: { kicker: 'LEVÉE + TRACTION', title: 'Seed signée, traction au rendez-vous', positive: true },
  survivor: { kicker: 'TOUJOURS DEBOUT', title: '18 mois tenus, sans décoller', positive: false },
  cash: { kicker: 'GAME OVER', title: 'Plus un euro en banque', positive: false },
  team: { kicker: 'GAME OVER', title: "L'équipe a lâché", positive: false },
};

export const PROFILES = {
  growth: { name: 'Le Growth Hacker', line: 'Pub, salons, visibilité : tu voulais du monde, et vite.' },
  product: { name: 'Le Product Lover', line: 'Ton produit d’abord. Les clients suivront. Ou pas.' },
  sales: { name: 'La Sales Machine', line: 'Tu décroches ton téléphone plus vite que ton ombre.' },
  cash: { name: 'Le Cash Keeper', line: 'Chaque euro dépensé te fait mal au cœur.' },
  recruit: { name: 'Le Serial Recruiter', line: 'Une équipe de rêve. Une masse salariale de cauchemar.' },
  corporate: { name: 'Le Corporate Addict', line: 'Les grands groupes, les POC et les badges visiteurs.' },
  fundraise: { name: 'Le Fundraiser', line: 'Ton deck est plus soigné que ton produit.' },
  team: { name: 'Le Coach', line: 'Ton équipe passe avant tout le reste.' },
  bootstrap: { name: 'Le Bootstrapper', line: 'Pas d’investisseurs, pas de problème.' },
  balanced: { name: "L'Équilibriste", line: 'Un peu de tout, avec mesure.' },
};

const eur = (n) => `${Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ')} €`;

// Fin évaluée au terme des 18 mois
export function evaluateFinal(s) {
  const e = CONFIG.endings;
  if (s.profitStreak >= e.profitStreak && s.team >= e.profitMinTeam) return 'profitable';
  if (s.flags.raised && s.pmf >= e.fundedMinPmf && s.mrr >= e.fundedMinMrr) return 'funded';
  return 'survivor';
}

export function endingType(s) {
  if (!s.ending) return null;
  return s.ending.type === 'final' ? evaluateFinal(s) : s.ending.type;
}

// ---------------------------------------------------------------------------
// Cause principale : la première règle qui colle l'emporte.

function staffCost(s) {
  return s.staff.reduce((sum, p) => sum + p.cost, 0);
}

function totalSpent(s) {
  return s.history.reduce((sum, h) => sum + Math.max(0, -(h.delta.cash || 0)), 0);
}

function causeOf(s, type) {
  const spentGrowth = s.stats.spent.growth || 0;
  const rules = {
    cash: [
      {
        id: 'hired-too-early',
        test: () => staffCost(s) >= s.costs * 0.35 && s.stats.hires.some((h) => h.mrr < 3000),
        title: 'Tu as recruté trop tôt.',
        text: `Tes salaires pesaient ${eur(staffCost(s))} par mois pour un MRR de ${eur(s.mrr)}. Un recrutement se paie avec des revenus qui existent déjà, pas avec ceux que tu espères.`,
      },
      {
        id: 'growth-without-pmf',
        test: () => spentGrowth >= 5000 && s.pmf < 35,
        title: 'Tu as acheté de la croissance sans PMF.',
        text: `Tu as mis ${eur(spentGrowth)} dans l'acquisition. Les clients arrivaient puis repartaient : ton produit ne les retenait pas encore.`,
      },
      {
        id: 'no-pmf',
        test: () => s.pmf < 30,
        title: "Ton produit n'a pas trouvé son marché.",
        text: `Avec un PMF de ${s.pmf}/100, les clients arrivaient au compte-gouttes et partaient vite. Parler aux utilisateurs coûte peu et change tout.`,
      },
      {
        id: 'big-spends',
        test: () => totalSpent(s) >= 12000,
        title: 'Trop de grosses dépenses.',
        text: `Au total, ${eur(totalSpent(s))} sont partis en dépenses ponctuelles. Chaque dépense raccourcit ton runway : elle doit rapporter avant la fin de ta trésorerie.`,
      },
      {
        id: 'paid-too-early',
        test: () => s.flags.foundersPaid && s.mrr < s.costs * 0.6,
        title: 'Vous vous êtes payés trop tôt.',
        text: `Vos salaires sont passés avant les revenus. Ton MRR (${eur(s.mrr)}) couvrait à peine la moitié de tes charges.`,
      },
      {
        id: 'slow-revenue',
        test: () => true,
        title: 'Les revenus sont arrivés trop tard.',
        text: `Ton MRR (${eur(s.mrr)}) ne couvrait pas tes charges (${eur(s.costs)}). Il te manquait quelques mois de runway : subvention, prêt d'honneur ou moins de dépenses.`,
      },
    ],
    team: [
      {
        id: 'overload',
        test: () => s.stats.overloadMonths >= 4,
        title: 'Ton équipe a porté trop de clients sans renfort.',
        text: `Pendant ${s.stats.overloadMonths} mois, chaque personne gérait plus de clients qu'elle ne le pouvait. La croissance fatigue : il faut recruter ou ralentir à temps.`,
      },
      {
        id: 'crunch',
        test: () => true,
        title: 'Trop de sprints, pas assez de pauses.',
        text: "Les nuits blanches et les coups de rush se sont accumulés. Une équipe épuisée ne livre plus rien, même avec du cash en banque.",
      },
    ],
    survivor: [
      {
        id: 'survivor-no-pmf',
        test: () => s.pmf < 40,
        title: 'Il manquait du PMF pour décoller.',
        text: `Tu as survécu, bravo. Mais avec un PMF de ${s.pmf}/100, ta croissance restait lente. La prochaine fois, investis plus tôt dans la compréhension de tes clients.`,
      },
      {
        id: 'survivor-late',
        test: () => true,
        title: 'La croissance est arrivée trop tard.',
        text: `Ton produit plaît (PMF ${s.pmf}/100), mais ton MRR ne paie pas encore tes charges et vos salaires. Il te manquait un accélérateur : commercial, levée, grand compte.`,
      },
    ],
    profitable: [
      {
        id: 'profitable',
        test: () => true,
        title: 'Tes revenus paient tes charges et vos salaires.',
        text: `${eur(s.mrr)} de MRR pour ${eur(s.costs)} de charges. Tu ne dépends de personne pour la suite.`,
      },
    ],
    funded: [
      {
        id: 'funded',
        test: () => true,
        title: 'Tu as levé avec de la traction.',
        text: `Les investisseurs ont suivi ton PMF et ton MRR. Lever achète du temps pour grandir, ce n'est pas une victoire en soi. Tu détiens désormais ${s.equity} % de ta boîte.`,
      },
    ],
    exit: [
      {
        id: 'exit',
        test: () => true,
        title: 'Un leader du marché rachète ta startup.',
        text: `Traction, PMF et timing : tout s'est aligné. Une fin rare. Tu détenais ${s.equity} % du capital au moment de la vente.`,
      },
    ],
  };
  const rule = rules[type].find((r) => r.test());
  return { id: rule.id, title: rule.title, text: rule.text };
}

function strengthOf(s) {
  const rules = [
    [s.pmf >= 55, `Tu avais trouvé ton marché : PMF de ${s.pmf}/100.`],
    [s.stats.peakMrr >= 5000, `Belle traction commerciale : jusqu'à ${eur(s.stats.peakMrr)} de MRR.`],
    [s.clients >= 15, `${s.clients} clients te faisaient confiance.`],
    [s.team >= 70, 'Tu as préservé ton équipe : elle était prête à repartir.'],
    [s.stats.minCash >= 3000, 'Tu as gardé le contrôle de ta trésorerie.'],
    [s.month >= 12, 'Tu as tenu plus d’un an. La plupart des runs s’arrêtent avant.'],
    [s.pmf >= CONFIG.start.pmf + 15, `Ton produit a progressé : PMF passé de ${CONFIG.start.pmf} à ${s.pmf}.`],
    [true, 'Tu as testé des choses. Tu sais quoi changer à la prochaine run.'],
  ];
  return rules.find(([ok]) => ok)[1];
}

export function profileOf(s, type) {
  if (type === 'profitable' && !s.flags.raised && !s.flags.angel) return { id: 'bootstrap', ...PROFILES.bootstrap };
  const counts = {};
  let total = 0;
  for (const h of s.history) {
    for (const t of h.tags) {
      counts[t] = (counts[t] || 0) + 1;
      total += 1;
    }
  }
  const order = Object.keys(PROFILES);
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]))[0];
  if (!top || top[1] / total < 0.3) return { id: 'balanced', ...PROFILES.balanced };
  return { id: top[0], ...PROFILES[top[0]] };
}

function keyDecisions(s) {
  const score = (h) =>
    Math.abs(h.delta.cash || 0) / 1000 +
    Math.abs(h.delta.pmf || 0) +
    Math.abs(h.delta.team || 0) / 2 +
    Math.abs(h.delta.costs || 0) / 500 +
    (h.hire ? 5 : 0);
  return s.history
    .map((h) => ({ ...h, score: score(h) }))
    .filter((h) => h.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => a.month - b.month);
}

// Résumé complet affiché à l'écran de fin et stocké dans l'historique.
export function buildRecap(s, records = { runs: [] }) {
  const type = endingType(s);
  const previousBest = records.bestMonths ?? null;
  return {
    type,
    ending: ENDINGS[type],
    positive: ENDINGS[type].positive,
    runNumber: records.runs.length + 1,
    monthsSurvived: s.month,
    stats: { cash: s.cash, mrr: s.mrr, clients: s.clients, pmf: s.pmf, team: s.team, equity: s.equity, costs: s.costs },
    cause: causeOf(s, type),
    strength: strengthOf(s),
    profile: profileOf(s, type),
    keyDecisions: keyDecisions(s),
    previousBest,
    newRecord: previousBest !== null && s.month > previousBest,
  };
}
