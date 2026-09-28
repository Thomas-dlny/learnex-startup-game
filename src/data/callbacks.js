// Conséquences différées, programmées par un choix via `delayed: [{ in: 3, id: '...' }]`.
//
// Deux sortes :
//   - passive (champ `outcomes`) : se résout toute seule au début du mois et s'affiche
//     dans le bandeau "Pendant ce temps". Un résultat peut déclencher un événement
//     interactif avec `trigger: 'id'`.
//   - interactive (champ `choices`) : devient l'événement principal du mois.
//     Même format que les événements de events.js.

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
        chance: { base: 0.3, pmf: 0.01 },
        effects: { clients: 2 },
        tone: 'good',
        text: 'Marc parle de toi à ses amis restaurateurs. 2 nouveaux clients, plein tarif.',
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
        chance: { base: 0.2, pmf: 0.008, market: { morose: -0.1, euphorique: 0.1 } },
        tone: 'good',
        text: 'Un contact rencontré sur ton stand te rappelle.',
        trigger: 'vivatech-poc',
      },
      {
        chance: { base: 0.3 },
        effects: { clients: 2 },
        tone: 'good',
        text: 'Deux restaurateurs croisés sur le stand signent enfin.',
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
    note: 'POC (Proof of Concept) : test payant du produit chez un client, avant un vrai contrat.',
    choices: [
      {
        label: 'Accepter le POC',
        hints: ['Potentiel commercial élevé', 'Charge importante'],
        tags: ['corporate'],
        effects: { cash: 6000, team: -10 },
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
        chance: { base: 0.1, pmf: 0.008, team: 0.003, market: { morose: -0.15, euphorique: 0.1 } },
        effects: { clients: 1, mrr: 2750 },
        tone: 'good',
        text: 'Le POC est validé. Contrat signé : 3 000 €/mois. Ton plus gros client.',
      },
      {
        effects: { pmf: 2 },
        tone: 'bad',
        text: 'Ton sponsor change de poste. Le POC s’arrête sans suite. Il te reste des retours produit précieux.',
      },
    ],
  },
  {
    id: 'bpi-result',
    title: 'Réponse de la Bourse French Tech',
    outcomes: [
      {
        chance: { base: 0.3, pmf: 0.01, team: 0.002 },
        effects: { cash: 30000 },
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
        if: { minPmf: 35, role: 'sales' },
        effects: { clients: 3 },
        tone: 'good',
        text: 'Inès cartonne : 3 contrats de plus ce mois-ci. Ton produit se vend bien quand on le présente.',
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
    choices: [
      {
        label: 'Te séparer d’Inès',
        hints: ['Moins de charges', 'Coût de départ', 'Moral en baisse'],
        tags: ['cash'],
        effects: { fire: 'sales', cash: -2000, team: -5 },
        text: 'Rupture de la période d’essai. Leçon apprise : un commercial accélère un produit qui se vend déjà.',
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
      { chance: { base: 0.4 }, effects: { clients: 1 }, tone: 'good', text: 'Un restaurateur te trouve sur Google et signe. Un seul.' },
      { tone: 'bad', text: 'Le site est superbe. Le trafic, lui, n’a pas bougé. Tes clients viennent du terrain.' },
    ],
  },
  {
    id: 'freelance-bug',
    title: 'Le code du freelance',
    outcomes: [{ effects: { pmf: -3, team: -4 }, tone: 'bad', text: 'Un bug du freelance fait planter Glane en plein service. Deux nuits pour tout reprendre.' }],
  },
  {
    id: 'intern-end',
    title: 'Fin du stage de Tom',
    outcomes: [
      { if: { role: 'intern' }, effects: { fire: 'intern', pmf: 2 }, tone: 'good', text: 'Tom termine son stage. Il laisse une base clients propre et un pot de départ mémorable.' },
      { text: 'Le stage de Tom aurait dû finir ce mois-ci.' },
    ],
  },
  {
    id: 'ads-churn',
    title: 'Les clients venus par la pub',
    outcomes: [
      {
        if: { maxPmf: 34 },
        effects: { clients: -3 },
        tone: 'bad',
        text: 'Ils partent déjà. La pub les a fait venir, ton produit ne les a pas retenus.',
      },
      { effects: { pmf: 1 }, tone: 'good', text: 'La plupart restent. Ton produit tient les promesses de la pub.' },
    ],
  },
  {
    id: 'mentor-corporate',
    title: 'L’intro de ton mentor',
    outcomes: [
      {
        chance: { base: 0.25, pmf: 0.01, market: { morose: -0.15, euphorique: 0.1 } },
        tone: 'good',
        text: 'Le directeur achats rappelle enfin. Il veut une démo.',
        trigger: 'mentor-poc',
      },
      { tone: 'bad', text: 'Le directeur achats a changé de poste. Son remplaçant ne répond pas.' },
    ],
  },
  {
    id: 'mentor-poc',
    category: 'Client corporate',
    speaker: 'Directeur achats, Restocol',
    stage: 'breaking',
    title: 'Un géant de la restauration collective veut un POC',
    text: '3 mois dans 20 cantines. Payé, mais ton équipe devra presque tout arrêter.',
    note: 'POC (Proof of Concept) : test payant du produit chez un client, avant un vrai contrat.',
    choices: [
      {
        label: 'Accepter le POC',
        hints: ['Potentiel commercial élevé', 'Charge importante'],
        tags: ['corporate'],
        effects: { cash: 6000, team: -10 },
        delayed: [{ in: 3, id: 'poc-result' }],
        text: '6 000 € au démarrage. Ton équipe vit dans des cuisines centrales.',
      },
      {
        label: 'Rester focus',
        hints: ['Moins de revenus potentiels', 'Produit mieux protégé'],
        tags: ['product'],
        effects: { team: 3, pmf: 3 },
        text: 'Tu déclines. Ton mentor ne t’en veut pas.',
      },
    ],
  },
  {
    id: 'angel-meeting',
    title: 'Café avec la business angel',
    outcomes: [
      {
        if: { notFlag: 'angel' },
        chance: { base: 0.15, pmf: 0.008, mrr: 0.08 },
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
    text: 'Elle croit en toi et connaît le secteur. Elle attend une réponse cette semaine.',
    note: 'Business angel : particulier qui investit son argent dans des startups contre des parts.',
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
      { chance: { base: 0.5 }, effects: { clients: -1 }, tone: 'bad', text: 'Nadia laisse un avis 1 étoile. Un prospect te le cite et signe ailleurs.' },
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
        chance: { base: 0.08, pmf: 0.006, market: { morose: -0.05, euphorique: 0.05 } },
        effects: { clients: 1, mrr: 3750 },
        tone: 'good',
        text: 'Tu remportes le marché : 4 000 €/mois pendant 3 ans. Tes 140 pages valaient le coup.',
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
      { chance: { base: 0.2, pmf: 0.01 }, effects: { clients: 4 }, tone: 'good', text: 'Un post sur le gaspillage devient viral. 4 restaurants t’écrivent.' },
      { effects: { clients: 1 }, tone: 'neutral', text: 'Tes posts plafonnent à 300 vues. Un client quand même.' },
    ],
  },
  {
    id: 'partner-result',
    title: 'Le partenariat avec Tiroir',
    outcomes: [
      {
        chance: { base: 0.2, pmf: 0.01 },
        effects: { clients: 6, mrrPct: -5 },
        tone: 'good',
        text: 'Leurs commerciaux vendent Glane avec chaque caisse : 6 nouveaux clients.',
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
          base: -0.3,
          pmf: 0.008,
          mrr: 0.05,
          market: { morose: -0.15, euphorique: 0.15 },
          flags: { investorReady: 0.2, angel: 0.1, investorContact: 0.05 },
        },
        tone: 'good',
        text: 'Un fonds veut aller plus loin. Il t’envoie une proposition.',
        trigger: 'term-sheet',
      },
      {
        effects: { team: -5 },
        tone: 'bad',
        text: 'Les fonds te disent « trop tôt ». Revenez avec plus de traction.',
      },
    ],
  },
  {
    id: 'term-sheet',
    category: 'Levée de fonds',
    speaker: 'Associée d’un fonds Seed',
    stage: 'breaking',
    title: 'Tu reçois une term sheet',
    text: '800 000 € contre 20 % de ta boîte. En échange, le fonds attend un plan de recrutement ambitieux.',
    note: 'Term sheet : proposition écrite d’investissement, avant les papiers définitifs.',
    choices: [
      {
        label: 'Signer',
        hints: ['Runway énorme', '20 % de capital cédé', 'Pression pour recruter'],
        tags: ['fundraise'],
        effects: {
          cash: 800000,
          equity: -20,
          flags: { raised: true },
          hire: [
            { role: 'sales', label: 'Commercial', cost: 3800 },
            { role: 'sales', label: 'Commerciale', cost: 3800 },
            { role: 'dev', label: 'Dev', cost: 4500 },
            { role: 'ops', label: 'Customer success', cost: 3200 },
          ],
        },
        text: 'Signé. Quatre recrutements lancés. Ton burn explose, ton runway aussi.',
      },
      {
        label: 'Négocier la valorisation',
        hints: ['Moins de capital cédé', 'Le fonds peut partir'],
        tags: ['fundraise'],
        outcomes: [
          {
            chance: { base: 0.45 },
            effects: {
              cash: 800000,
              equity: -15,
              flags: { raised: true },
              hire: [
                { role: 'sales', label: 'Commercial', cost: 3800 },
                { role: 'sales', label: 'Commerciale', cost: 3800 },
                { role: 'dev', label: 'Dev', cost: 4500 },
                { role: 'ops', label: 'Customer success', cost: 3200 },
              ],
            },
            text: 'Le fonds accepte 15 %. Quatre recrutements lancés.',
          },
          { effects: { team: -6 }, text: 'Le fonds se retire. « Bonne chance pour la suite. »' },
        ],
      },
      {
        label: 'Refuser, rester indépendant',
        hints: ['Tu gardes le contrôle'],
        tags: ['cash'],
        effects: { team: 3 },
        text: 'Tu refuses. Lever n’est pas une fin en soi.',
      },
    ],
  },
  {
    id: 'intl-result',
    title: 'Glane à Madrid',
    outcomes: [
      { chance: { base: 0.05, pmf: 0.008 }, effects: { clients: 8 }, tone: 'good', text: 'Madrid adopte Glane : 8 restaurants en un mois. Javier en veut plus.' },
      { effects: { clients: 1 }, tone: 'bad', text: 'Traduction, TVA, droit local : tout prend trois fois plus de temps. Un seul client signé.' },
    ],
  },
  {
    id: 'big-account-risk',
    title: 'Ton contrat exclusif',
    outcomes: [
      {
        chance: { base: 0.35 },
        effects: { mrr: -2500 },
        tone: 'bad',
        text: 'Nouveau directeur achats : il renégocie ton contrat à la baisse. Sans autre chaîne, tu n’as aucun levier.',
      },
      { tone: 'good', effects: { clients: 1 }, text: 'Le contrat tourne bien. La chaîne te recommande à un de ses fournisseurs.' },
    ],
  },
];
