// Conséquences différées, programmées par un choix via `delayed: [{ in: 3, id: '...' }]`.
//
// Deux sortes :
//   - passive (champ `outcomes`) : se résout toute seule au début du mois et s'affiche
//     dans le bandeau "Pendant ce temps". Un résultat peut déclencher un événement
//     interactif avec `trigger: 'id'`. Un texte vide ('') n'affiche rien.
//   - interactive (champ `choices`) : devient l'événement principal du mois.
//     Même format que les événements de events.js.

const SEED_HIRES = [
  { role: 'sales', label: 'Commercial', cost: 3800 },
  { role: 'sales', label: 'Commerciale', cost: 3800 },
  { role: 'dev', label: 'Dev', cost: 4500 },
  { role: 'ops', label: 'Customer success', cost: 3200 },
];

const DEEP_HIRES = [
  { role: 'dev', label: 'Ingénieure hardware', cost: 5000 },
  { role: 'dev', label: 'Data scientist', cost: 4800 },
  { role: 'sales', label: 'Directeur commercial industrie', cost: 4500 },
];

export const CALLBACKS = [
  {
    id: 'feature-flop',
    title: 'Tes 3 features du mois 1',
    outcomes: [
      {
        if: { maxPmf: 30 },
        effects: { pmf: -3 },
        tone: 'bad',
        text: 'Statistiques d’usage : personne ne s’en sert. Tu as codé pour toi, pas pour tes clients.',
      },
      { effects: { pmf: 2 }, tone: 'good', text: 'Une des trois est adoptée. Les deux autres dorment.' },
    ],
  },
  {
    id: 'discount-referral',
    title: 'Ton client à -50 %',
    outcomes: [
      {
        chance: { base: 0.2, pmf: 0.008 },
        effects: { clients: 1 },
        tone: 'good',
        text: 'Marc parle de toi à un ami restaurateur. Un nouveau client, plein tarif.',
      },
      {
        effects: { team: -3 },
        tone: 'bad',
        text: 'Marc réclame une nouvelle remise « vu la conjoncture ». Les petits prix attirent les négociateurs.',
      },
    ],
  },
  {
    id: 'free-trial-end',
    title: 'Fin de l’essai gratuit',
    outcomes: [
      {
        chance: { base: 0.2, pmf: 0.015 },
        effects: { clients: 1 },
        tone: 'good',
        text: 'La brasserie passe en payant. Tes corrections l’ont convaincue.',
      },
      { effects: {}, tone: 'bad', text: 'La brasserie ne convertit pas. « Sympa, mais pas indispensable. »' },
    ],
  },
  {
    id: 'vivatech-callback',
    title: 'Retour de VivaTech',
    outcomes: [
      {
        chance: { base: 0.15, pmf: 0.006, market: { morose: -0.1, euphorique: 0.1 } },
        tone: 'good',
        text: 'Un contact rencontré sur ton stand te rappelle.',
        trigger: 'vivatech-poc',
      },
      {
        chance: { base: 0.3 },
        effects: { clients: 1 },
        tone: 'good',
        text: 'Un client croisé sur le stand signe enfin.',
      },
      {
        effects: {},
        tone: 'bad',
        text: 'Trois mois après, aucun lead n’a abouti. Les cartes de visite prennent la poussière.',
      },
    ],
  },
  {
    id: 'vivatech-poc',
    category: 'Client corporate',
    speaker: 'Hugo, directeur innovation chez Restocol',
    stage: 'breaking',
    title: 'Restocol veut tester ton produit',
    text: 'Le géant de la restauration collective, croisé à VivaTech, propose un POC payant de 3 mois dans 20 cantines. Ton équipe devra presque tout arrêter.',
    advice: 'Qu’est-ce que Hugo devra prouver à sa direction pour transformer ce POC en contrat ?',
    choices: [
      {
        label: 'Accepter le POC',
        hints: ['Potentiel commercial élevé', 'Charge importante', 'Contrat pas garanti'],
        tags: ['corporate'],
        effects: { cash: 6000, team: -10, flags: { corporateWarm: true } },
        delayed: [{ in: 3, id: 'poc-result' }],
        text: '6 000 € versés au démarrage. Ton équipe passe ses journées dans des cuisines centrales.',
      },
      {
        label: 'Rester focus',
        hints: ['Moins de revenus potentiels', 'Produit mieux protégé'],
        tags: ['product'],
        effects: { team: 3, pmf: 3 },
        text: 'Tu déclines poliment. Hugo garde ton contact « pour plus tard ».',
      },
    ],
  },
  {
    id: 'poc-result',
    title: 'Fin du POC corporate',
    outcomes: [
      {
        chance: { base: -0.25, pmf: 0.009, team: 0.003, market: { morose: -0.15, euphorique: 0.1 }, flags: { corporateReady: 0.12 } },
        tone: 'good',
        delayed: [{ in: 2, id: 'corporate-sign' }],
        text: 'Le POC est validé. Les achats lancent le contrat : signature prévue dans deux mois.',
      },
      {
        effects: { pmf: 2 },
        tone: 'bad',
        text: 'Ton sponsor change de poste. Le POC s’arrête sans suite. Il te reste des retours produit précieux.',
      },
    ],
  },
  {
    id: 'corporate-sign',
    title: 'La signature du grand compte',
    outcomes: [
      {
        if: { market: 'morose', notFlag: 'corporateDelayed' },
        chance: { base: 0.5 },
        effects: { flags: { corporateDelayed: true } },
        delayed: [{ in: 2, id: 'corporate-sign' }],
        tone: 'bad',
        text: 'Budget gelé pour cause de conjoncture. Signature repoussée de deux mois.',
      },
      {
        chance: { base: 0.35, pmf: 0.006, team: 0.002, flags: { corporateReady: 0.1 } },
        effects: { clients: 1, mrr: 2000, flags: { corporateClient: true } },
        tone: 'good',
        text: 'Contrat signé. Il a fallu trois comités et une réunion juridique, mais c’est ton plus gros client.',
      },
      {
        effects: { pmf: 1 },
        tone: 'bad',
        text: 'Au dernier comité, les achats demandent un appel d’offres. Tout est à refaire.',
      },
    ],
  },
  {
    id: 'bpi-result',
    title: 'Réponse de la Bourse French Tech',
    outcomes: [
      {
        chance: { base: 0.2, pmf: 0.01, team: 0.002 },
        effects: { cash: 30000, flags: { grant: true } },
        tone: 'good',
        text: 'Dossier accepté : 30 000 € de subvention. Pas de capital cédé, pas de remboursement.',
      },
      {
        effects: { team: -3 },
        tone: 'bad',
        text: 'Refusé. Le jury trouve ton marché « encore flou ». Tu retenteras avec plus de preuves.',
      },
    ],
  },
  {
    id: 'sales-review',
    title: 'Trois mois avec Inès',
    outcomes: [
      {
        if: { minPmf: 40, role: 'sales' },
        effects: { clients: 2 },
        tone: 'good',
        text: 'Inès est lancée : 2 contrats de plus ce mois-ci. Ton produit se vend bien quand on le présente.',
      },
      {
        if: { role: 'sales' },
        tone: 'bad',
        text: 'Inès bute sur les mêmes objections à chaque rendez-vous.',
        trigger: 'sales-struggle',
      },
      { effects: {}, text: 'Inès est partie avant la fin de sa période d’essai.' },
    ],
  },
  {
    id: 'sales-struggle',
    category: 'Recrutement',
    speaker: 'Inès, commerciale',
    stage: 'flash',
    title: '« Je n’arrive pas à le vendre »',
    text: 'Inès a fait 60 rendez-vous. Les restaurateurs aiment l’idée mais ne voient pas assez de valeur pour payer.',
    advice: 'Le problème vient d’Inès, du produit, ou de la cible ? Ses 60 rendez-vous ont la réponse.',
    choices: [
      {
        label: 'Te séparer d’Inès',
        hints: ['Moins de charges', 'Coût de départ', 'Moral en baisse'],
        tags: ['cash'],
        effects: { fire: 'sales', cash: -2000, team: -5 },
        text: 'Rupture de la période d’essai. Une leçon chère.',
        lesson: 'Un commercial accélère un produit qui se vend déjà. Il ne remplace pas le PMF.',
      },
      {
        label: 'La garder et retravailler l’offre avec elle',
        hints: ['Charges maintenues', 'Tu apprends de ses rendez-vous'],
        tags: ['product', 'recruit'],
        effects: { pmf: 6, team: -3 },
        text: 'Vous épluchez ses 60 rendez-vous ensemble. Les objections deviennent ta roadmap.',
      },
    ],
  },
  {
    id: 'site-result',
    title: 'Ton site à 5 000 €',
    outcomes: [
      { chance: { base: 0.3 }, effects: { clients: 1 }, tone: 'good', text: 'Un client te trouve sur Google et signe. Un seul.' },
      { tone: 'bad', text: 'Le site est superbe. Le trafic, lui, n’a pas bougé. Tes clients viennent du terrain.' },
    ],
  },
  {
    id: 'freelance-bug',
    title: 'Le code du freelance',
    outcomes: [{ effects: { pmf: -3, team: -4 }, tone: 'bad', text: 'Un bug du freelance fait planter {name} en plein service. Deux nuits pour tout reprendre.' }],
  },
  {
    id: 'intern-end',
    title: 'Fin du stage de Tom',
    outcomes: [
      { if: { role: 'intern' }, effects: { fire: 'intern', pmf: 2 }, tone: 'good', text: 'Tom termine son stage. Il laisse une base clients propre et un pot de départ mémorable.' },
      { text: '' },
    ],
  },
  {
    id: 'ads-churn',
    title: 'Les clients venus par la pub',
    outcomes: [
      {
        if: { maxPmf: 39 },
        effects: { clients: -2 },
        tone: 'bad',
        text: 'Ils partent déjà. La pub les a fait venir, ton produit ne les a pas retenus.',
      },
      { effects: { pmf: 1 }, tone: 'good', text: 'La plupart restent. Ton produit tient les promesses de la pub.' },
    ],
  },
  {
    id: 'mentor-corporate',
    title: 'L’intro de Robin',
    outcomes: [
      {
        chance: { base: 0.2, pmf: 0.008, market: { morose: -0.15, euphorique: 0.1 } },
        tone: 'good',
        text: 'Le directeur achats rappelle enfin. Il veut une démo.',
        trigger: 'mentor-poc',
      },
      { tone: 'neutral', text: 'Le directeur achats ne rappelle pas encore. Robin garde le contact au chaud.' },
    ],
  },
  {
    id: 'mentor-poc',
    category: 'Client corporate',
    speaker: 'Directeur achats, Restocol',
    stage: 'breaking',
    title: 'Un géant de la restauration collective veut un POC',
    text: '3 mois dans 20 cantines. Payé, mais ton équipe devra presque tout arrêter.',
    choices: [
      {
        label: 'Accepter le POC',
        hints: ['Potentiel commercial élevé', 'Charge importante', 'Contrat pas garanti'],
        tags: ['corporate'],
        effects: { cash: 6000, team: -10, flags: { corporateWarm: true } },
        delayed: [{ in: 3, id: 'poc-result' }],
        text: '6 000 € au démarrage. Ton équipe vit dans des cuisines centrales.',
      },
      {
        label: 'Rester focus',
        hints: ['Moins de revenus potentiels', 'Produit mieux protégé'],
        tags: ['product'],
        effects: { team: 3, pmf: 3 },
        text: 'Tu déclines. Robin ne t’en veut pas.',
      },
    ],
  },
  {
    id: 'angel-meeting',
    title: 'Café avec la business angel',
    outcomes: [
      {
        if: { notFlag: 'angel' },
        chance: { base: 0.1, pmf: 0.006, mrr: 0.06 },
        tone: 'good',
        text: 'Elle a aimé tes chiffres. Elle revient avec une proposition.',
        trigger: 'angel-intro-offer',
      },
      { effects: { team: -2 }, tone: 'bad', text: '« Trop tôt pour moi. Montrez-moi 3 000 € de revenus mensuels et on en reparle. »' },
    ],
  },
  {
    id: 'angel-intro-offer',
    category: 'Business angel',
    speaker: 'Business angel de la foodtech',
    title: '50 000 € contre 10 % de ta boîte',
    text: 'Cette business angel croit en toi et connaît le secteur. Elle attend une réponse cette semaine.',
    choices: [
      {
        label: 'Accepter',
        hints: ['Beaucoup de runway', 'Tu cèdes du capital'],
        tags: ['fundraise'],
        effects: { cash: 50000, equity: -10, flags: { angel: true } },
        text: 'Signé. Elle te présente déjà à trois restaurateurs de son réseau.',
      },
      {
        label: 'Refuser',
        hints: ['Tu gardes 100 % de ta boîte'],
        tags: ['cash'],
        effects: {},
        text: 'Tu préfères attendre d’avoir plus de levier.',
      },
    ],
  },
  {
    id: 'bad-review',
    title: 'L’avis de Nadia',
    outcomes: [
      { chance: { base: 0.5 }, effects: { clients: -1 }, tone: 'bad', text: 'Nadia laisse un avis 1 étoile. Un client le lit et part aussi.' },
      { tone: 'neutral', text: 'Nadia a tourné la page. Toi aussi.' },
    ],
  },
  {
    id: 'tension-returns',
    title: 'Le désaccord avec ton associé',
    outcomes: [
      { if: { maxTeam: 55 }, effects: { team: -12 }, tone: 'bad', text: 'Le sujet ressurgit devant un client. Ambiance glaciale au bureau.' },
      { effects: { pmf: 1 }, tone: 'good', text: 'Les chiffres ont tranché pour vous. Le sujet est clos.' },
    ],
  },
  {
    id: 'junior-bug',
    title: 'Trois mois avec ton dev junior',
    outcomes: [
      { chance: { base: 0.4 }, effects: { pmf: -4, team: -5 }, tone: 'bad', text: 'Il pousse une mise à jour un vendredi soir. Week-end de réparations.' },
      { effects: { pmf: 3 }, tone: 'good', text: 'Il progresse vite et livre sa première grosse fonctionnalité.' },
    ],
  },
  {
    id: 'tender-result',
    title: 'Résultat de l’appel d’offres',
    outcomes: [
      {
        chance: { base: -0.15, pmf: 0.006, market: { morose: -0.05, euphorique: 0.05 }, flags: { corporateReady: 0.08 } },
        effects: { clients: 1, mrr: 2500, flags: { corporateClient: true } },
        tone: 'good',
        text: 'Tu remportes le marché : 80 cantines pendant 3 ans. Tes 140 pages valaient le coup.',
      },
      { effects: { pmf: 2 }, tone: 'bad', text: 'Marché attribué à un grand éditeur. Ton prix était bon, ta taille non.' },
    ],
  },
  {
    id: 'salary-fatigue',
    title: 'Toujours pas de salaire',
    outcomes: [
      {
        if: { notFlag: 'foundersPaid' },
        effects: { team: -8 },
        tone: 'bad',
        text: 'Ton associé fait des missions freelance le soir pour payer son loyer. Il est moins présent.',
      },
      { text: 'Vous avez fini par vous payer. La fatigue retombe.' },
    ],
  },
  {
    id: 'content-effect',
    title: 'Tes posts LinkedIn',
    outcomes: [
      { chance: { base: 0.1, pmf: 0.008 }, effects: { clients: 3 }, tone: 'good', text: 'Un post sur le gaspillage devient viral. 3 clients t’écrivent.' },
      { effects: { clients: 1 }, tone: 'neutral', text: 'Tes posts plafonnent à 300 vues. Un client quand même.' },
    ],
  },
  {
    id: 'partner-result',
    title: 'Le partenariat avec Tiroir',
    outcomes: [
      {
        chance: { base: 0.05, pmf: 0.007 },
        effects: { clients: 4, mrrPct: -5 },
        tone: 'good',
        text: 'Leurs commerciaux vendent {name} avec chaque caisse : 4 nouveaux clients.',
      },
      { effects: { clients: 1 }, tone: 'bad', text: 'L’intégration traîne. Leurs commerciaux ont d’autres priorités. Un seul client.' },
    ],
  },
  {
    id: 'late-payment-paid',
    title: 'Le client en retard',
    outcomes: [{ effects: { cash: 1500 }, tone: 'good', text: 'Le virement arrive enfin. 1 500 € rentrent.' }],
  },
  {
    id: 'vat-installment',
    title: 'Échéance de TVA',
    outcomes: [{ effects: { cash: -1000 }, tone: 'neutral', text: '1 000 € prélevés, comme prévu.' }],
  },
  {
    id: 'seed-result',
    title: 'Ta levée Seed',
    outcomes: [
      {
        chance: {
          base: -0.55,
          pmf: 0.008,
          mrr: 0.035,
          growth: 0.15,
          market: { morose: -0.15, euphorique: 0.15 },
          flags: { investorReady: 0.15, gaspardLead: 0.25, gaspardInterested: 0.1, angel: 0.05, investorContact: 0.05, kpiTracking: 0.05, patent: 0.1 },
        },
        tone: 'good',
        text: '{investor} veut aller plus loin. Une proposition arrive.',
        trigger: 'term-sheet',
      },
      {
        effects: { team: -5, flags: { fundraising: false } },
        tone: 'bad',
        text: 'Les fonds te disent « trop tôt ». Revenez avec plus de traction.',
      },
    ],
  },
  {
    id: 'term-sheet',
    category: 'Levée de fonds',
    speaker: '{investor}, fonds Seed',
    stage: 'breaking',
    title: 'Tu reçois une term sheet',
    text: '800 000 € contre 20 % de ta boîte. En échange, le fonds attend un plan de recrutement ambitieux et une croissance rapide.',
    advice: 'Cet argent paie 4 salaires de plus. Ta croissance peut-elle suivre le rythme que le fonds attend ?',
    choices: [
      {
        label: 'Signer',
        hints: ['Runway énorme', '20 % de capital cédé', 'Pression pour recruter et grandir'],
        tags: ['fundraise'],
        effects: { cash: 800000, equity: -20, flags: { raised: true, fundraising: false }, hire: SEED_HIRES },
        delayed: [{ in: 4, id: 'board-pressure' }],
        text: 'Signé. Quatre recrutements lancés. Ton burn fait un bond, ton runway aussi.',
      },
      {
        label: 'Négocier la valorisation',
        hints: ['Moins de capital cédé', 'Le fonds peut partir'],
        tags: ['fundraise'],
        outcomes: [
          {
            chance: { base: 0.4, flags: { gaspardLead: 0.15 } },
            effects: { cash: 800000, equity: -15, flags: { raised: true, fundraising: false }, hire: SEED_HIRES },
            delayed: [{ in: 4, id: 'board-pressure' }],
            text: 'Le fonds accepte 15 %. Quatre recrutements lancés.',
          },
          { effects: { team: -6, flags: { fundraising: false } }, text: 'Le fonds se retire. « Bonne chance pour la suite. »' },
        ],
      },
      {
        label: 'Refuser, rester indépendant',
        hints: ['Tu gardes le contrôle'],
        tags: ['cash'],
        effects: { team: 3, flags: { fundraising: false } },
        text: 'Tu refuses. Lever n’est pas une fin en soi.',
      },
    ],
  },
  {
    id: 'board-pressure',
    title: 'Ton premier board',
    outcomes: [
      {
        chance: { base: -0.1, growth: 0.6 },
        effects: { team: 3 },
        tone: 'good',
        text: 'Ta croissance suit le plan. Les investisseurs sont rassurés.',
      },
      {
        effects: { team: -8 },
        tone: 'bad',
        text: '« La croissance ne suit pas le plan. » Pression maximale sur toute l’équipe.',
      },
    ],
  },
  {
    id: 'intl-result',
    title: '{name} à Madrid',
    outcomes: [
      { chance: { base: -0.2, pmf: 0.008 }, effects: { clients: 6 }, tone: 'good', text: 'Madrid adopte {name} : 6 restaurants en un mois. Javier en veut plus.' },
      { effects: { clients: 1 }, tone: 'bad', text: 'Traduction, TVA, droit local : tout prend trois fois plus de temps. Un seul client signé.' },
    ],
  },
  {
    id: 'big-account-sign',
    title: 'La chaîne de 200 restaurants',
    outcomes: [
      {
        chance: { base: 0.15, pmf: 0.006, flags: { corporateReady: 0.1 }, market: { morose: -0.15 } },
        effects: { clients: 1, mrr: 3250, flags: { corporateClient: true } },
        delayed: [{ in: 4, id: 'big-account-risk' }],
        tone: 'good',
        text: 'Contrat signé avec exclusivité. Ton plus gros client, de loin.',
      },
      {
        effects: { team: -3 },
        tone: 'bad',
        text: 'Leur comité d’investissement repousse le projet à l’an prochain. Deux mois de négociation pour rien.',
      },
    ],
  },
  {
    id: 'big-account-risk',
    title: 'Ton contrat exclusif',
    outcomes: [
      {
        chance: { base: 0.35 },
        effects: { mrr: -1750 },
        tone: 'bad',
        text: 'Nouveau directeur achats : il renégocie ton contrat à la baisse. Sans autre chaîne, tu n’as aucun levier.',
      },
      { tone: 'good', effects: { clients: 1 }, text: 'Le contrat tourne bien. La chaîne te recommande à un de ses fournisseurs.' },
    ],
  },
  {
    id: 'big-prospect-sign',
    title: 'Le module de planning',
    outcomes: [
      {
        chance: { base: 0.3, pmf: 0.005 },
        effects: { clients: 1, mrr: 650 },
        tone: 'good',
        text: 'Module livré, contrat signé pour ses 12 restaurants.',
      },
      {
        tone: 'bad',
        effects: { team: -3 },
        text: 'Module livré. Il demande « encore deux ou trois ajustements » avant de signer. Puis il ne répond plus.',
      },
    ],
  },
  {
    id: 'feature-deals',
    title: 'L’export comptable',
    outcomes: [
      { chance: { base: 0.3, pmf: 0.006 }, effects: { clients: 2 }, tone: 'good', text: 'Deux des trois prospects signent.' },
      { effects: { clients: 1 }, tone: 'neutral', text: 'Un prospect signe. Les deux autres ont trouvé un autre prétexte.' },
    ],
  },
  {
    id: 'postponed-deal-result',
    title: 'Le prospect qui repoussait',
    outcomes: [
      { chance: { base: 0.35, pmf: 0.004 }, effects: { clients: 1 }, tone: 'good', text: 'Le comité a validé. Contrat signé, plein tarif.' },
      { tone: 'bad', text: 'Nouveau report. Tu classes le dossier.' },
    ],
  },
  {
    id: 'peer-tip',
    title: 'Le conseil de Yasmine',
    outcomes: [
      { chance: { base: 0.6 }, effects: { pmf: 3 }, tone: 'good', text: 'Yasmine te partage son script de démo. Tes rendez-vous gagnent en clarté.' },
      { effects: { team: 3 }, tone: 'good', text: 'Un dîner entre fondateurs. Rien de concret, mais tu repars regonflé.' },
    ],
  },
  {
    id: 'gaspard-returns',
    title: 'Gaspard reprend contact',
    outcomes: [
      {
        if: { notFlag: ['raised', 'fundraising'], minPmf: 45, minMrr: 4000 },
        effects: { flags: { gaspardInterested: true } },
        tone: 'good',
        text: 'Il a suivi tes chiffres. Il veut te revoir.',
        trigger: 'gaspard-offer',
      },
      {
        if: { notFlag: ['raised', 'fundraising'], path: 'deeptech', flag: 'pilotSigned' },
        effects: { flags: { gaspardInterested: true } },
        tone: 'good',
        text: 'Il a entendu parler de ton pilote signé. Il veut te revoir.',
        trigger: 'gaspard-offer',
      },
      {
        if: { notFlag: ['raised', 'fundraising'] },
        tone: 'neutral',
        text: 'Un mail rapide : « Pas encore. Continuez comme ça, je garde un œil sur vous. »',
      },
      { text: '' },
    ],
  },
  {
    id: 'gaspard-offer',
    category: 'Levée de fonds',
    speaker: 'Gaspard, associé d’un fonds Seed',
    stage: 'breaking',
    title: 'Gaspard veut mener ton tour de table',
    text: '« Vous avez tenu parole. Si vous êtes prêts, je peux mener une levée Seed. » Deux mois de due diligence en vue.',
    advice: 'Une levée apporte du runway, mais aussi un rythme imposé. Lequel des deux te manque le plus ?',
    choices: [
      {
        label: 'Lancer la levée avec Gaspard',
        hints: ['Deux mois intenses', 'Un investisseur qui te connaît déjà'],
        tags: ['fundraise'],
        effects: { team: -8, flags: { gaspardLead: true, fundraising: true } },
        delayed: [{ in: 2, id: 'seed-result' }],
        text: 'Poignée de main. Gaspard présente {name} à son comité la semaine prochaine.',
      },
      {
        label: 'Pas maintenant, rester indépendant',
        hints: ['Tu gardes le contrôle', 'La porte reste ouverte'],
        tags: ['cash'],
        effects: { team: 2 },
        text: 'Gaspard sourit. « La porte reste ouverte. »',
      },
    ],
  },
  {
    id: 'churn-surprise',
    title: 'Le churn que ton mentor avait vu venir',
    outcomes: [
      { if: { maxPmf: 50 }, effects: { clientsPct: -15 }, tone: 'bad', text: 'Trois résiliations le même mois. Les signaux étaient là.' },
      { tone: 'good', text: 'Fausse alerte cette fois. Ton produit retient bien ses clients.' },
    ],
  },
  {
    id: 'federation-result',
    title: 'La newsletter de la fédération',
    outcomes: [
      { chance: { base: 0.2, pmf: 0.008 }, effects: { clients: 4 }, tone: 'good', text: 'La newsletter fait mouche : 4 restaurants t’appellent.' },
      { effects: { clients: 1 }, tone: 'neutral', text: 'Un seul appel. Les restaurateurs lisent peu leurs mails.' },
    ],
  },

  // Deeptech
  {
    id: 'dt-accuracy',
    title: 'Tes 88 % de précision',
    outcomes: [
      { if: { maxPmf: 25 }, effects: { pmf: -2 }, tone: 'bad', text: 'Les cuisines s’en fichent : elles voulaient des recommandations, pas une meilleure photo.' },
      { effects: { pmf: 3 }, tone: 'good', text: 'La précision rassure les chefs. Ils commencent à croire tes chiffres.' },
    ],
  },
  {
    id: 'dt-inov-result',
    title: 'Résultat du concours i-Nov',
    outcomes: [
      {
        chance: { base: -0.05, pmf: 0.007, flags: { patent: 0.15, pilotSigned: 0.1, pilotStarted: 0.05 } },
        effects: { cash: 90000, flags: { grant: true } },
        tone: 'good',
        text: 'Lauréat : 90 000 € de subvention. Tu peux enfin embaucher ta première ingénieure.',
      },
      { effects: { team: -3 }, tone: 'bad', text: 'Pas retenu. Le jury veut voir un pilote en conditions réelles.' },
    ],
  },
  {
    id: 'dt-pilot-result',
    title: 'Fin du pilote Restocol',
    outcomes: [
      {
        chance: { base: -0.1, pmf: 0.009, team: 0.002, flags: { shortPilot: -0.15, corporateReady: 0.1 } },
        effects: { clients: 1, mrr: 2100, flags: { pilotSigned: true, corporateClient: true } },
        tone: 'good',
        text: 'Pilote validé : -18 % de déchets mesurés. Contrat signé pour 5 sites.',
      },
      {
        chance: { base: 0.5 },
        effects: { pmf: 4 },
        tone: 'neutral',
        text: 'Résultats encourageants, mais leur direction veut un deuxième pilote l’an prochain.',
      },
      { effects: { pmf: 2 }, tone: 'bad', text: 'La cuisine change de chef. Le pilote s’arrête sans conclusion.' },
    ],
  },
  {
    id: 'dt-cir-result',
    title: 'Ton crédit d’impôt recherche',
    outcomes: [{ effects: { cash: 6000 }, tone: 'good', text: 'Le CIR tombe : 6 000 €, commission du cabinet déduite.' }],
  },
  {
    id: 'dt-cir-self',
    title: 'Ton crédit d’impôt recherche',
    outcomes: [
      { chance: { base: 0.65 }, effects: { cash: 7500, flags: { grant: true } }, tone: 'good', text: 'Dossier accepté sans question : 7 500 €.' },
      { tone: 'bad', text: 'Ton dossier revient avec des questions. Réponse l’an prochain.' },
    ],
  },
  {
    id: 'dt-deepfund-result',
    title: 'La due diligence d’Élise',
    outcomes: [
      {
        chance: {
          base: -0.35,
          pmf: 0.008,
          market: { morose: -0.1, euphorique: 0.1 },
          flags: { patent: 0.2, pilotSigned: 0.25, grant: 0.1, gaspardInterested: 0.05, investorReady: 0.1 },
        },
        tone: 'good',
        text: 'L’expert technique est convaincu. Élise t’envoie une proposition.',
        trigger: 'dt-term-sheet',
      },
      { effects: { team: -5, flags: { fundraising: false } }, tone: 'bad', text: '« Revenez avec un pilote signé et un brevet. »' },
    ],
  },
  {
    id: 'dt-term-sheet',
    category: 'Levée de fonds',
    speaker: 'Élise, associée d’un fonds deeptech',
    stage: 'breaking',
    title: '1,5 M€ contre 25 % de ta boîte',
    text: 'Élise veut financer 18 mois de R&D et d’industrialisation. En échange : trois recrutements clés et un premier déploiement à grande échelle.',
    choices: [
      {
        label: 'Signer',
        hints: ['Runway énorme', '25 % de capital cédé', 'Recrutements imposés'],
        tags: ['fundraise'],
        effects: { cash: 1500000, equity: -25, flags: { raised: true, fundraising: false }, hire: DEEP_HIRES },
        delayed: [{ in: 4, id: 'board-pressure' }],
        text: 'Signé. Ingénieure hardware, data scientist, directeur commercial : l’équipe triple.',
      },
      {
        label: 'Négocier à 20 %',
        hints: ['Moins de capital cédé', 'Elle peut partir'],
        tags: ['fundraise'],
        outcomes: [
          {
            chance: { base: 0.4, flags: { patent: 0.1 } },
            effects: { cash: 1500000, equity: -20, flags: { raised: true, fundraising: false }, hire: DEEP_HIRES },
            delayed: [{ in: 4, id: 'board-pressure' }],
            text: 'Élise accepte 20 %. Trois recrutements lancés.',
          },
          { effects: { team: -6, flags: { fundraising: false } }, text: 'Élise se retire. « Dommage, j’aimais le projet. »' },
        ],
      },
      {
        label: 'Refuser',
        hints: ['Tu gardes le contrôle'],
        tags: ['cash'],
        effects: { team: 3, flags: { fundraising: false } },
        text: 'Tu refuses. Tu continues avec tes subventions et tes pilotes.',
      },
    ],
  },
];
