// Paramètres d'équilibrage du jeu.
// Modifie ces valeurs pour rendre le jeu plus facile ou plus dur,
// puis lance `npm run simulate` pour mesurer l'effet sur des centaines de parties.

export const CONFIG = {
  months: 18,

  // État de départ
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

  // Croissance organique : nouveaux clients par mois = PMF x growthPerPmf x multiplicateurs
  growthPerPmf: 1 / 20,
  salesPmfThreshold: 35, // au-dessus, un commercial est efficace
  salesBoostWithPmf: 0.8, // +80 % de croissance par commercial
  salesBoostWithoutPmf: 0.3, // +30 % seulement si le produit ne se vend pas encore seul
  marketGrowth: { morose: 0.8, normal: 1, euphorique: 1.2 },

  // Part des clients perdus chaque mois selon le PMF
  churn: [
    { below: 25, rate: 0.1 },
    { below: 45, rate: 0.05 },
    { below: 65, rate: 0.025 },
    { below: 101, rate: 0.01 },
  ],

  devPmfPerMonth: 1, // chaque développeur fait progresser le produit

  // Charge de l'équipe
  clientsPerPerson: 8,
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

  // Fins positives
  endings: {
    profitStreak: 3, // mois consécutifs rentables (salaires fondateurs compris)
    profitMinTeam: 25,
    fundedMinPmf: 45,
    fundedMinMrr: 5000,
  },
};
