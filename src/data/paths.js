// Les trois parcours. Même moteur, réglages différents.
//
//   unlockAfter  nombre de runs terminées pour débloquer le parcours
//   start        état de départ (écrase CONFIG.start)
//   growth       multiplicateur de la croissance organique (bouche-à-oreille, commerciaux)
//   churn        multiplicateur du churn
//   clientsPerPerson  clients qu'une personne peut suivre avant la surcharge
//   setupFee     € encaissés à chaque nouveau client (frais d'installation)
//   endings      seuils des fins positives (écrasent CONFIG.endings)
//   first        événement du mois 1
//
// Les événements choisissent leurs parcours avec `paths: ['saas', ...]` (tous par défaut)
// et leur poids avec `weight: { saas: 2, deeptech: 0.5 }`.

export const PATHS = {
  saas: {
    id: 'saas',
    label: 'SaaS B2B',
    kicker: 'Hypercroissance',
    defaultName: 'Glane',
    product: 'logiciel anti-gaspillage pour restaurants',
    pitch: 'Un logiciel vendu par abonnement aux restaurants. Tu vises la croissance, les grands comptes et une levée de fonds.',
    traits: ['Croissance rapide possible', 'Burn élevé', 'Levée de fonds accessible'],
    unlockAfter: 0,
    start: { cash: 10000, costs: 1800, arpu: 250, team: 80, pmf: 15 },
    growth: 1,
    churn: 1,
    clientsPerPerson: 6,
    setupFee: 0,
    endings: { fundedMinMrr: 6000, fundedMinPmf: 45 },
    first: 'interviews',
  },
  bootstrap: {
    id: 'bootstrap',
    label: 'Bootstrap',
    kicker: 'Sans investisseurs',
    defaultName: 'Popote',
    product: 'outil anti-gaspillage pour restaurants de quartier',
    pitch: 'Pas d’investisseurs. Chaque client paie une installation et un petit abonnement. Tu grandis au rythme de tes revenus.',
    traits: ['Dépenses serrées', 'Proche de tes clients', 'Rentabilité comme objectif'],
    unlockAfter: 1,
    start: { cash: 8000, costs: 900, arpu: 160, team: 80, pmf: 20 },
    growth: 0.95,
    churn: 0.75,
    clientsPerPerson: 10,
    setupFee: 350,
    endings: { fundedMinMrr: 99999, fundedMinPmf: 101 },
    first: 'bs-first',
  },
  deeptech: {
    id: 'deeptech',
    label: 'Deeptech',
    kicker: 'Technologie de rupture',
    defaultName: 'Kiloscope',
    product: 'capteur qui pèse et reconnaît les déchets des cuisines centrales',
    pitch: 'Un capteur et une IA qui mesurent le gaspillage des cuisines centrales. Longue R&D, pilotes industriels, subventions et gros financements.',
    traits: ['Revenus lents à venir', 'Pilotes et industriels', 'Subventions et gros financements'],
    unlockAfter: 2,
    start: { cash: 25000, costs: 2600, arpu: 900, team: 80, pmf: 12 },
    growth: 0.25,
    churn: 0.5,
    clientsPerPerson: 3,
    setupFee: 0,
    endings: { fundedMinMrr: 1500, fundedMinPmf: 35 },
    first: 'dt-first',
  },
};

export const PATH_ORDER = ['saas', 'bootstrap', 'deeptech'];

export function pathOf(s) {
  return PATHS[s?.path] || PATHS.saas;
}

export function unlockedPaths(totalRuns = 0) {
  return PATH_ORDER.filter((id) => totalRuns >= PATHS[id].unlockAfter);
}
