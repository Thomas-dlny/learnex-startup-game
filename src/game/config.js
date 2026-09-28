// Paramètres d'équilibrage du jeu.
// Modifie ces valeurs pour rendre le jeu plus facile ou plus dur,
// puis lance `npm run simulate` pour mesurer l'effet sur des centaines de parties.
// Les réglages propres à chaque parcours (SaaS, Bootstrap, Deeptech) sont dans src/data/paths.js.

export const CONFIG = {
  months: 18,

  // État de départ par défaut (chaque parcours peut l'écraser)
  start: {
    cash: 10000, // €
    costs: 1800, // charges mensuelles en € (outils, hébergement, compta). Fondateurs non payés.
    arpu: 250, // prix moyen payé par un client, en €/mois
    team: 80, // moral et énergie de l'équipe, 0 à 100
    pmf: 15, // Product-Market Fit, 0 à 100
    equity: 100, // % du capital détenu par les fondateurs
  },
  founders: 2,

  // Salaire des deux fondateurs. Compte dans la condition "Rentable"
  // tant qu'ils ne se paient pas encore (flag foundersPaid).
  founderSalary: 3600,

  // Croissance organique, par mois :
  //   growthBase x facteur PMF x (1 + commerciaux x boost) x marché x saturation
  // Facteur PMF = ((PMF - pmfFloor) / (pmfFull - pmfFloor)) ^ pmfCurve : nul sous pmfFloor, 1 à pmfFull.
  growthBase: 3.5,
  pmfFloor: 10,
  pmfFull: 55,
  pmfCurve: 1.3,
  // Rendements décroissants : la croissance ralentit quand la base clients grossit.
  saturationClients: 80,
  salesPmfThreshold: 40, // au-dessus, un commercial est efficace
  salesBoostWithPmf: 0.8, // +80 % de croissance par commercial
  salesBoostWithoutPmf: 0.15, // presque rien si le produit ne se vend pas encore seul
  marketGrowth: { morose: 0.75, normal: 1, euphorique: 1.2 },
  raisedGrowthBoost: 1.4, // budget marketing apporté par une levée

  // Recrutement : une recrue n'est efficace qu'après son intégration,
  // et chaque intégration fatigue l'équipe.
  onboardingMonths: 2,
  onboardingTeamCost: 2,

  // Part des clients perdus chaque mois selon le PMF
  churn: [
    { below: 25, rate: 0.1 },
    { below: 40, rate: 0.06 },
    { below: 55, rate: 0.035 },
    { below: 70, rate: 0.02 },
    { below: 101, rate: 0.012 },
  ],

  devPmfPerMonth: 1, // chaque développeur intégré fait progresser le produit

  // Charge de l'équipe
  clientsPerPerson: 6,
  calmLoad: 0.5, // sous cette charge (clients / capacité), l'équipe récupère
  teamRecovery: 2,
  teamOverload: -3,
  teamHeavyOverload: -6,
  heavyOverloadRatio: 1.5,

  // Filets de sécurité
  runwayAlertMonths: 2,
  maxRunwayAlerts: 2,
  teamCrisisAt: 30,

  // Marché
  marketChangeFromMonth: 4,
  marketChangeChance: 0.22,

  // Pédagogie : encadrés « À retenir » par run
  maxLessons: 4,

  // Fins positives
  endings: {
    profitStreak: 2, // mois consécutifs rentables (salaires fondateurs compris)
    profitMinTeam: 25,
    fundedMinPmf: 45,
    fundedMinMrr: 6000,
  },
};
