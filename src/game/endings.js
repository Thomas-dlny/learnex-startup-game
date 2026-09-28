// Fins de partie, cause principale, points forts, profil du joueur et récit de la run.
// Les textes sont ici pour rester modifiables sans toucher aux composants.

import { CONFIG } from './config.js';
import { eur } from './format.js';
import { pathOf } from '../data/paths.js';
import { MILESTONES } from '../data/milestones.js';

export const ENDINGS = {
  exit: { kicker: 'EXIT', title: 'Ta startup est rachetée', positive: true, rare: true },
  profitable: { kicker: 'RENTABLE', title: 'Ta startup vit de ses revenus', positive: true },
  funded: { kicker: 'LEVÉE + TRACTION', title: 'Levée signée, traction au rendez-vous', positive: true },
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

export function endingRules(s) {
  return { ...CONFIG.endings, ...pathOf(s).endings };
}

// Fin évaluée au terme des 18 mois
export function evaluateFinal(s) {
  const e = endingRules(s);
  if (s.profitStreak >= e.profitStreak && s.team >= e.profitMinTeam) return 'profitable';
  if (s.flags.raised && s.pmf >= e.fundedMinPmf && s.mrr >= e.fundedMinMrr && s.team >= e.profitMinTeam) return 'funded';
  return 'survivor';
}

export function endingType(s) {
  if (!s.ending) return null;
  return s.ending.type === 'final' ? evaluateFinal(s) : s.ending.type;
}

// Gros titre de la fin, avec le nom de la startup.
export function headlineOf(s, type) {
  const name = s.name || 'Ta startup';
  const n = s.month;
  switch (type) {
    case 'cash':
      return `${name} ferme après ${n} mois`;
    case 'team':
      return `${name} s’arrête au mois ${n} : l’équipe est à bout`;
    case 'survivor':
      if (s.flags?.raised && s.team < endingRules(s).profitMinTeam) return `${name} lève, mais finit à bout de souffle`;
      if (s.flags?.raised) return `${name} lève, sans assez de traction`;
      return `${name} tient 18 mois, sans décoller`;
    case 'profitable':
      return `${name} vit de ses revenus`;
    case 'funded':
      return `${name} lève avec de la traction`;
    case 'exit':
      return `${name} est rachetée`;
    default:
      return name;
  }
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
        id: 'raised-crunch',
        test: () => s.flags.raised && s.stats.hires.filter((h) => s.month - h.month <= 3).length >= 3,
        title: 'Ta levée a achevé une équipe déjà fatiguée.',
        text: 'Lever, c’est aussi intégrer plusieurs recrues d’un coup. Chaque intégration pèse sur l’équipe pendant deux mois. Arrivée épuisée, elle n’a pas tenu.',
      },
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
        text: 'Les nuits blanches et les coups de rush se sont accumulés. Une équipe épuisée ne livre plus rien, même avec du cash en banque.',
      },
    ],
    survivor: [
      {
        id: 'survivor-raised-tired',
        test: () => s.flags.raised && s.team < endingRules(s).profitMinTeam,
        title: 'Ta levée est arrivée sur une équipe épuisée.',
        text: `Tu as signé ta levée, mais ton équipe termine à ${s.team}/100. Les recrues imposées par le fonds demandent deux mois d’intégration : une équipe déjà à bout ne les encaisse pas. Une levée réussie se prépare aussi côté énergie.`,
      },
      {
        id: 'survivor-raised',
        test: () => s.flags.raised,
        title: 'Tu as levé, mais la traction ne suit pas encore.',
        text: `PMF ${s.pmf}/100 et ${eur(s.mrr)} de MRR : les investisseurs attendent au moins un PMF de ${endingRules(s).fundedMinPmf} et ${eur(endingRules(s).fundedMinMrr)} de MRR. Tu as du runway pour y arriver, pas encore les chiffres.`,
      },
      {
        id: 'survivor-tired',
        test: () => s.team < endingRules(s).profitMinTeam,
        title: 'Ton équipe est à bout.',
        text: `Les chiffres tiennent, mais ton équipe termine à ${s.team}/100. Une startup rentable avec une équipe épuisée ne tient pas longtemps. Recrute ou ralentis avant la casse.`,
      },
      {
        id: 'survivor-no-salary',
        test: () => s.mrr >= s.costs && !s.flags.foundersPaid,
        title: 'Tu couvres tes charges, pas encore vos salaires.',
        text: `${eur(s.mrr)} de MRR pour ${eur(s.costs)} de charges : ton cash ne baisse plus. Mais vous ne vous payez pas. Il te faut ${eur(s.costs + CONFIG.founderSalary)} de MRR pour être vraiment rentable.`,
      },
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
        text: `${eur(s.mrr)} de MRR pour ${eur(s.costs)} de charges${s.flags.foundersPaid ? ', salaires compris' : ', et de quoi vous payer'}. Tu ne dépends de personne pour la suite.`,
      },
    ],
    funded: [
      {
        id: 'funded',
        test: () => true,
        title: 'Tu as levé avec de la traction.',
        text: `Les investisseurs ont suivi ton PMF et tes preuves terrain. Lever achète du temps pour grandir, ce n'est pas une victoire en soi. Tu détiens désormais ${s.equity} % de ta boîte.`,
      },
    ],
    exit: [
      {
        id: 'exit',
        test: () => true,
        title: 'Ta startup est rachetée.',
        text: `Traction, PMF et timing : tout s'est aligné. Une fin rare. Tu détenais ${s.equity} % du capital au moment de la vente.`,
      },
    ],
  };
  const rule = rules[type].find((r) => r.test());
  return { id: rule.id, title: rule.title, text: rule.text };
}

// Une piste concrète pour la prochaine run, selon la cause.
const NEXT_TRY = {
  'hired-too-early': 'Attends que ton MRR paie la moitié du salaire avant de recruter en CDI. Un freelance ou un stagiaire peut faire le pont.',
  'growth-without-pmf': 'Monte ton PMF au-dessus de 40 avant de payer de la pub ou des salons : interviews, onboarding, appels clients.',
  'no-pmf': 'Commence par parler à tes clients : interviews au mois 1, appels clients les mois calmes. Le PMF débloque tout le reste.',
  'big-spends': 'Avant chaque dépense, regarde ton runway : combien de mois elle te coûte, et quand elle rapporte.',
  'paid-too-early': 'Verse-vous un salaire quand ton MRR couvre tes charges. Avant, cherche un prêt d’honneur ou une subvention.',
  'slow-revenue': 'Sécurise du runway tôt : Bourse French Tech, prêt d’honneur, ou dépenses plus serrées les 6 premiers mois.',
  'raised-crunch': 'Avant de signer une levée, remonte l’énergie de ton équipe : une pause ou un freelance. Les recrues du fonds la fatiguent pendant deux mois.',
  'survivor-raised-tired': 'Lève plus tôt, ou avec une équipe au-dessus de 50 : les recrues imposées par le fonds fatiguent tout le monde pendant leur intégration.',
  'survivor-raised': 'Lève quand ta courbe monte déjà : PMF au-dessus de 45 et MRR qui grimpe depuis 3 mois.',
  overload: 'Surveille la charge de ton équipe : au-delà de 6 clients par personne, recrute ou ralentis.',
  crunch: 'Garde des mois pour souffler. Une équipe au-dessus de 50 encaisse les coups durs.',
  'survivor-tired': 'Protège ton équipe en fin de run : un recrutement ou une pause au bon moment change tout.',
  'survivor-no-salary': 'Tu y étais presque. Pousse tes prix ou vise un grand compte pour franchir le seuil de rentabilité.',
  'survivor-no-pmf': 'Investis dans ton produit plus tôt : ton PMF décide de ta vitesse de croissance.',
  'survivor-late': 'Accélère au bon moment : un commercial quand ton PMF dépasse 40, une levée quand ta croissance se voit.',
  profitable: 'Et si tu tentais un autre parcours, ou une levée avec Gaspard ?',
  funded: 'Tente de devenir rentable sans lever : c’est une autre façon de gagner.',
  exit: 'Une exit est rare. Tente le même exploit dans un autre parcours.',
};

function strengthOf(s) {
  const start = pathOf(s).start.pmf;
  const rules = [
    [s.pmf >= 55, `Tu avais trouvé ton marché : PMF de ${s.pmf}/100.`],
    [s.stats.peakMrr >= 5000, `Belle traction commerciale : jusqu'à ${eur(s.stats.peakMrr)} de MRR.`],
    [s.clients >= 15, `${s.clients} clients te faisaient confiance.`],
    [s.team >= 70, 'Tu as préservé ton équipe : elle était prête à repartir.'],
    [s.stats.minCash >= 3000, 'Tu as gardé le contrôle de ta trésorerie.'],
    [s.month >= 12, 'Tu as tenu plus d’un an. La plupart des runs s’arrêtent avant.'],
    [s.pmf >= start + 15, `Ton produit a progressé : PMF passé de ${start} à ${s.pmf}.`],
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

const decisionScore = (h) =>
  Math.abs(h.delta.cash || 0) / 1000 +
  Math.abs(h.delta.pmf || 0) +
  Math.abs(h.delta.team || 0) / 2 +
  Math.abs(h.delta.costs || 0) / 500 +
  Math.abs(h.delta.clients || 0) * 1.5 +
  (h.hire ? 5 : 0);

function keyDecisions(s, n = 3) {
  return s.history
    .map((h) => ({ ...h, score: decisionScore(h) }))
    .filter((h) => h.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .sort((a, b) => a.month - b.month);
}

// Récit de la run : décisions structurantes, jalons et fin, dans l'ordre des mois.
function storyOf(s, type) {
  const entries = [];
  for (const d of keyDecisions(s, 5)) {
    entries.push({ month: d.month, kind: 'decision', title: d.choice, detail: d.title });
  }
  for (const m of s.milestones || []) {
    const def = MILESTONES.find((x) => x.id === m.id);
    if (def) entries.push({ month: m.month, kind: 'milestone', title: def.label, icon: def.icon });
  }
  const end = ENDINGS[type];
  entries.push({
    month: s.month,
    kind: 'ending',
    title: end.positive ? end.kicker : headlineOf(s, type),
    icon: end.positive ? '🏁' : type === 'survivor' ? '⏳' : '💀',
    positive: end.positive,
  });
  const order = { decision: 0, milestone: 1, ending: 2 };
  return entries.sort((a, b) => a.month - b.month || order[a.kind] - order[b.kind]);
}

// Résumé complet affiché à l'écran de fin et stocké dans l'historique.
export function buildRecap(s, records = { runs: [] }) {
  const type = endingType(s);
  const previousBest = records.bestMonths ?? null;
  const cause = causeOf(s, type);
  const reached = s.milestones || [];
  const wins = reached.map((m) => MILESTONES.find((x) => x.id === m.id)).filter(Boolean);
  const known = new Set(records.milestones || []);
  return {
    type,
    ending: ENDINGS[type],
    positive: ENDINGS[type].positive,
    headline: headlineOf(s, type),
    name: s.name,
    path: s.path,
    pathLabel: pathOf(s).label,
    runNumber: (records.totalRuns ?? records.runs.length) + 1,
    monthsSurvived: s.month,
    stats: { cash: s.cash, mrr: s.mrr, clients: s.clients, pmf: s.pmf, team: s.team, equity: s.equity, costs: s.costs },
    cause,
    nextTry: NEXT_TRY[cause.id] || NEXT_TRY['slow-revenue'],
    strength: strengthOf(s),
    profile: profileOf(s, type),
    keyDecisions: keyDecisions(s),
    story: storyOf(s, type),
    wins: wins.map((w) => ({ ...w, isNew: !known.has(w.id) })),
    milestoneIds: reached.map((m) => m.id),
    previousBest,
    newRecord: previousBest !== null && s.month > previousBest,
    bestMrr: records.bestMrr ?? null,
    newMrrRecord: (records.bestMrr ?? 0) > 0 && s.mrr > records.bestMrr,
  };
}
