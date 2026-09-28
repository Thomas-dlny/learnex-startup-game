// Événements des personnages récurrents : Thomas et Robin (mentors EDHEC Entrepreneurs)
// et Gaspard (investisseur). Ils donnent accès, challengent, ouvrent des portes.
// Le joueur décide. Les flags gardent la mémoire de la relation d'un mois à l'autre.
// Même format que events.js.

export const PEOPLE_EVENTS = [
  {
    id: 'mentor-checkin',
    months: [2, 5],
    weight: 2,
    category: 'Incubateur',
    speaker: 'mentor',
    title: 'Point mensuel avec {mentor}',
    text: '{mentor} pose ton tableau de bord sur la table. « Qui est ton client idéal, en une phrase ? » Silence gêné.',
    advice: 'Si tu ne sais pas encore répondre, qu’est-ce qui t’aiderait à le savoir d’ici un mois ?',
    choices: [
      {
        label: 'Organiser un atelier de segmentation',
        hints: ['Une journée de travail', 'Ta cible devient claire'],
        tags: ['product'],
        effects: { team: -3, pmf: 5 },
        text: {
          default: 'Deux heures de post-it. Ta cible passe de « les restaurants » à « les restaurants de 40 à 120 couverts qui cuisinent maison ».',
          deeptech: 'Deux heures de post-it. Ta cible passe de « la restauration collective » à « les cuisines centrales de plus de 3 000 repas par jour ».',
        },
      },
      {
        label: 'Demander l’intro d’une fondatrice du batch précédent',
        hints: ['Un regard extérieur', 'Effet dans quelques semaines'],
        tags: ['team'],
        effects: { team: 4, flags: { peerIntro: true } },
        delayed: [{ in: 2, id: 'peer-tip' }],
        text: '{mentor} te présente Yasmine, passée par l’incubateur l’an dernier. Rendez-vous pris.',
      },
      {
        label: 'Reporter le point',
        hints: ['Tu gagnes une heure'],
        tags: ['cash'],
        effects: {},
        text: '« Pas de souci. » {mentor} note quand même la question dans ton dossier.',
      },
    ],
  },

  {
    id: 'gaspard-coffee',
    months: [4, 7],
    weight: 3,
    when: { notFlag: 'metGaspard' },
    category: 'Investisseur',
    speaker: 'Gaspard, associé d’un fonds Seed',
    title: 'Gaspard passe à l’incubateur',
    text: 'Robin te présente Gaspard, associé d’un fonds Seed. Il a 20 minutes entre deux rendez-vous. « Racontez-moi {name}. »',
    advice: 'Gaspard voit des centaines de startups par an. Qu’est-ce qui fera qu’il se souvienne de toi dans six mois ?',
    choices: [
      {
        label: 'Lui pitcher une levée',
        hints: ['Tu testes ton histoire', 'Il sera franc'],
        tags: ['fundraise'],
        effects: { team: -2, flags: { metGaspard: true } },
        delayed: [{ in: 7, id: 'gaspard-returns' }],
        outcomes: [
          {
            if: { minMrr: 2500, minPmf: 40 },
            effects: { flags: { gaspardInterested: true } },
            text: '« Intéressant. Envoyez-moi vos chiffres chaque mois. » Il repart avec ton deck.',
          },
          { text: '« Reviens me voir quand vous aurez davantage de traction. » Il te laisse sa carte.' },
        ],
      },
      {
        label: 'Lui demander un avis franc sur ton modèle',
        hints: ['Ça peut piquer', 'Tu apprends'],
        tags: ['product'],
        effects: { pmf: 3, flags: { metGaspard: true } },
        delayed: [{ in: 7, id: 'gaspard-returns' }],
        text: 'Il pointe ton prix trop bas et tes clients qui partent. Ça pique, c’est utile. « Tenez-moi au courant. »',
      },
      {
        label: 'Décliner, tu as une démo client',
        hints: ['Ton client d’abord'],
        tags: ['sales'],
        outcomes: [
          { chance: { base: 0.3, pmf: 0.005 }, effects: { clients: 1 }, text: 'Tu files chez ton client. Démo réussie, contrat signé.' },
          { text: 'Tu files chez ton client. Il « va réfléchir ». Gaspard, lui, est déjà reparti.' },
        ],
      },
    ],
  },

  {
    id: 'mentor-workshop',
    months: [5, 10],
    category: 'Incubateur',
    speaker: 'mentor',
    title: 'Trois ateliers cette semaine, tu en choisis un',
    text: '{mentor} te pousse à venir. Au programme : vente, recrutement, négociation avec les grands comptes.',
    advice: 'Quel est le prochain mur contre lequel tu vas te cogner ?',
    choices: [
      {
        label: 'Atelier vente',
        hints: ['Tes rendez-vous gagnent en efficacité'],
        tags: ['sales'],
        effects: { team: -2, flags: { salesWorkshop: true } },
        outcomes: [
          { chance: { base: 0.25, pmf: 0.006 }, effects: { clients: 1 }, text: 'Tu repars avec un script de découverte client. Tu signes un client la semaine suivante.' },
          { text: 'Tu repars avec un script de découverte client. Reste à le roder.' },
        ],
      },
      {
        label: 'Atelier recrutement',
        hints: ['Tes prochaines recrues s’intégreront plus vite'],
        tags: ['recruit'],
        effects: { team: -1, flags: { hiringWorkshop: true } },
        text: 'Fiche de poste, entretien structuré, plan d’intégration. Ta prochaine recrue sera efficace un mois plus tôt.',
      },
      {
        label: 'Atelier grands comptes',
        hints: ['Tu comprends les grands groupes', 'Utile pour les POC'],
        tags: ['corporate'],
        effects: { team: -2, flags: { corporateReady: true } },
        text: 'Acheteurs, juristes, comités : tu comprends enfin pourquoi un grand groupe met 6 mois à signer.',
      },
    ],
  },

  {
    id: 'mentor-challenge',
    months: [8, 13],
    when: { minClients: 5 },
    category: 'Incubateur',
    speaker: 'mentor',
    title: '{mentor} te challenge sur tes chiffres',
    text: '« Ton MRR monte, mais combien de clients partent chaque mois ? » Tu n’as pas la réponse.',
    advice: 'Tu connais ton churn ? Si non, qu’est-ce que ça dit de ta façon de piloter ?',
    choices: [
      {
        label: 'Appeler chaque client parti',
        hints: ['Du temps', 'Tu comprends pourquoi ils partent'],
        tags: ['product'],
        effects: { team: -4, pmf: 5 },
        text: 'Six appels, un même motif : la prise en main est trop longue. Tu sais quoi corriger.',
        lesson: 'Le churn dit ce que tes clients ne te disent pas en face.',
      },
      {
        label: 'Suivre tes indicateurs chaque mois',
        hints: ['Petit effort régulier', 'Investisseurs rassurés'],
        tags: ['team'],
        effects: { team: -1, pmf: 2, flags: { kpiTracking: true } },
        text: 'Un tableau simple : MRR, churn, clients actifs. Ton prochain rendez-vous investisseur sera plus facile.',
      },
      {
        label: 'Lui répondre que tout va bien',
        hints: ['Aucun effort'],
        tags: ['sales'],
        effects: { team: 1 },
        delayed: [{ in: 2, id: 'churn-surprise' }],
        text: '{mentor} hausse un sourcil. « Si tu le dis. »',
      },
    ],
  },

  {
    id: 'corporate-followup',
    months: [8, 15],
    when: { flag: 'corporateWarm', notFlag: 'corporateClient' },
    weight: 2,
    category: 'Client corporate',
    speaker: 'Robin, mentor EDHEC Entrepreneurs',
    title: 'Robin relance son contact grand compte',
    text: 'Le directeur achats rencontré grâce à l’incubateur a un budget pour l’an prochain. Il veut une proposition chiffrée.',
    advice: 'Un grand groupe achète d’abord une réduction de risque. Qu’est-ce qui le rassurerait ?',
    choices: [
      {
        label: 'Proposer un pilote payant',
        hints: ['Cycle long', 'Plus facile à accepter pour eux'],
        tags: ['corporate'],
        effects: { team: -6, cash: 3000 },
        delayed: [{ in: 3, id: 'corporate-sign' }],
        text: 'Pilote accepté, 3 000 € versés. Juridique, achats, sécurité informatique : trois circuits de validation pour la suite.',
      },
      {
        label: 'Proposer directement un gros contrat',
        hints: ['Réponse rapide', 'Risque de refus'],
        tags: ['corporate', 'sales'],
        outcomes: [
          {
            chance: { base: 0.05, pmf: 0.004, flags: { corporateReady: 0.15 } },
            effects: { clients: 1, mrr: 1750, team: -4, flags: { corporateClient: true } },
            text: 'Ils signent sans pilote. Robin n’en revient pas.',
          },
          { effects: { team: -3 }, text: '« Trop tôt pour nous. Commençons petit. » Le dossier repart en bas de la pile.' },
        ],
      },
      {
        label: 'Décliner, rester sur ton cœur de cible',
        hints: ['Tu gardes ton focus'],
        tags: ['product'],
        effects: { pmf: 2 },
        text: 'Tu remercies Robin. Il te garde le contact au chaud.',
      },
    ],
  },

  {
    id: 'budget-freeze',
    months: [8, 17],
    when: { market: 'morose' },
    category: 'Conjoncture',
    stage: 'flash',
    title: 'Les grands groupes gèlent leurs budgets',
    text: 'Marché tendu : les achats non essentiels sont repoussés à l’an prochain. Tes prospects ne répondent plus.',
    advice: 'Qui continue d’acheter quand tout le monde gèle ses budgets ?',
    choices: [
      {
        label: 'Accélérer sur les petits clients',
        hints: ['Cycle court', 'Fatigue'],
        tags: ['sales'],
        effects: { team: -4 },
        outcomes: [
          { chance: { base: 0.3, pmf: 0.006 }, effects: { clients: 2 }, text: 'Les indépendants, eux, signent vite. 2 clients de plus.' },
          { effects: { clients: 1 }, text: 'Un petit client de plus. Tout le monde serre les budgets.' },
        ],
      },
      {
        label: 'Réduire tes dépenses fixes',
        hints: ['Burn plus faible', 'Moins d’outils'],
        tags: ['cash'],
        effects: { costs: -400, pmf: -1 },
        text: 'Tu renégocies tes abonnements et coupes un outil. Le burn baisse un peu.',
      },
      {
        label: 'Attendre des jours meilleurs',
        hints: ['Aucun effort'],
        tags: ['cash'],
        effects: { team: -2 },
        text: 'Tu attends. Les semaines passent lentement.',
      },
    ],
  },
];
