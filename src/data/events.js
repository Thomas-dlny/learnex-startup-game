// Événements principaux du jeu.
//
// Pour ajouter un événement : copie une entrée, change son `id` (unique) et ses textes.
// Champs :
//   id        identifiant unique
//   months    [premier mois, dernier mois] où l'événement peut sortir
//   category  étiquette affichée au-dessus du titre
//   speaker   personnage qui parle (optionnel)
//   stage     'flash' | 'breaking' | 'alert' pour une mise en scène forte (optionnel)
//   title, text   textes courts (2 phrases max)
//   note      explication d'un mot de jargon (optionnel)
//   when      conditions d'apparition : minPmf, maxPmf, minMrr, maxMrr, minCash, maxCash,
//             minClients, maxClients, minTeam, maxTeam, minStaff, maxStaff,
//             role ('dev' | 'sales' | 'intern'), noRole, flag, notFlag, market
//   weight    probabilité relative (1 par défaut)
//   choices   2 ou 3 options :
//     label    texte du bouton
//     hints    indices qualitatifs affichés AVANT le choix (évite les chiffres exacts)
//     tags     style de jeu pour le profil de fin : growth, product, sales, cash,
//              recruit, corporate, fundraise, team
//     if       conditions pour afficher l'option (mêmes clés que `when`)
//     effects  effets immédiats : cash, mrr, clients, team, pmf, costs, arpu, equity,
//              mrrPct, arpuPct, clientsPct, costsPct,
//              hire: { role, label, cost }, fire: 'dev' | 'sales' | 'intern' | 'all',
//              flags: { nom: true }, market: 'morose' | 'normal' | 'euphorique'
//     delayed  conséquences différées : [{ in: nb de mois, id: 'id dans callbacks.js' }]
//     outcomes résultats aléatoires : [{ if, chance, text, effects, delayed }]
//              chance = { base, pmf, team, mrr (par 1 000 € de MRR), market: {...}, flags: {...} }
//              le premier résultat tiré l'emporte, le dernier sert de repli
//     text     ce qui s'est passé, affiché après le choix
//     end      'exit' termine la partie (rachat)

export const EVENTS = [
  // ---------------------------------------------------------------------------
  // ACTE 1 : SURVIVRE (mois 1 à 6)

  {
    id: 'interviews',
    months: [1, 1],
    category: 'Premier mois',
    speaker: 'Léa, coach EDHEC Entrepreneurs',
    title: 'Par quoi tu commences ?',
    text: 'Ton MVP tourne chez 3 restaurants amis. Tu as une liste de 12 features à coder et zéro client payant.',
    note: 'MVP : première version du produit, simple, faite pour apprendre.',
    choices: [
      {
        label: 'Interviewer 15 restaurateurs',
        hints: ['Deux semaines sans coder', 'Petit coût', 'Tu comprends mieux ton marché'],
        tags: ['product'],
        effects: { cash: -300, team: -3, pmf: 12 },
        text: 'Surprise : leur vrai problème, ce sont les commandes fournisseurs, pas les stocks. Tu revois ta priorité numéro 1.',
      },
      {
        label: 'Coder les features de ta liste',
        hints: ['Le produit avance', 'Tu restes dans ta zone de confort'],
        tags: ['product'],
        effects: { pmf: 2, team: -2 },
        delayed: [{ in: 3, id: 'feature-flop' }],
        text: 'Trois features livrées en un mois. Tu es fier. Reste à savoir si quelqu’un s’en sert.',
      },
      {
        label: 'Prospecter tout de suite',
        hints: ['Premières ventes possibles', 'Le produit reste imparfait'],
        tags: ['sales'],
        outcomes: [
          {
            chance: { base: 0.6 },
            effects: { clients: 1, team: -3 },
            text: '40 appels, 1 restaurant signé. Le patron te dit : « Je prends, mais faut que ça marche. »',
          },
          { effects: { team: -4 }, text: '40 appels, beaucoup de « rappelez-moi ». Aucun contrat.' },
        ],
      },
    ],
  },

  {
    id: 'first-prospect',
    months: [2, 5],
    category: 'Premier client',
    speaker: 'Marc, patron de brasserie',
    title: '« Je signe, mais à moitié prix »',
    text: 'Une brasserie de 80 couverts veut ton logiciel. Le patron négocie dur : -50 % ou rien.',
    choices: [
      {
        label: 'Accepter la remise',
        hints: ['Un client tout de suite', 'Prix cassé', 'Il parlera de toi ?'],
        tags: ['sales'],
        effects: { clients: 1, mrr: -125 },
        delayed: [{ in: 3, id: 'discount-referral' }],
        text: 'Contrat signé à 125 €/mois. Ton premier logo sur le site.',
      },
      {
        label: 'Tenir ton prix',
        hints: ['Résultat incertain', 'Tu testes ta valeur'],
        tags: ['cash'],
        outcomes: [
          {
            chance: { base: 0.25, pmf: 0.012 },
            effects: { clients: 1, pmf: 2 },
            text: 'Il râle, puis signe à plein tarif. Ton produit vaut son prix.',
          },
          { effects: {}, text: 'Il part chez un concurrent moins cher. Tu gardes ta fierté, pas le client.' },
        ],
      },
      {
        label: 'Offrir 3 mois gratuits',
        hints: ['Zéro revenu pour l’instant', 'Beaucoup de retours produit'],
        tags: ['product'],
        effects: { pmf: 5, team: -2 },
        delayed: [{ in: 3, id: 'free-trial-end' }],
        text: 'Il teste tout, se plaint de tout. Tes notes produit débordent.',
      },
    ],
  },

  {
    id: 'vivatech',
    months: [4, 7],
    category: 'Salon',
    speaker: 'Léa, coach EDHEC Entrepreneurs',
    stage: 'breaking',
    title: 'VivaTech t’ouvre un stand',
    text: 'Quatre jours au plus grand salon tech d’Europe, dans l’espace startups. Le stand coûte 4 000 €.',
    choices: [
      {
        label: 'Prendre le stand',
        hints: ['Coût : 4 000 €', 'Grosse fatigue', 'Retombées incertaines'],
        tags: ['growth', 'corporate'],
        effects: { cash: -4000, team: -6 },
        delayed: [{ in: 3, id: 'vivatech-callback' }],
        text: '300 cartes de visite, 2 kilos de goodies, une extinction de voix. Maintenant, il faut attendre.',
      },
      {
        label: 'Y aller en visiteur',
        hints: ['Coût : 300 €', 'Quelques contacts'],
        tags: ['cash'],
        effects: { cash: -300, team: -2 },
        outcomes: [
          {
            chance: { base: 0.35 },
            effects: { flags: { investorContact: true } },
            text: 'Au bar du salon, tu croises une business angel. Elle garde ta carte.',
          },
          { effects: {}, text: 'Beaucoup de conférences, peu de rencontres utiles. Mais de bonnes idées.' },
        ],
      },
      {
        label: 'Rester au bureau',
        hints: ['Ton équipe souffle', 'Tu avances sur le produit'],
        tags: ['product'],
        effects: { team: 3, pmf: 2 },
        text: 'Pendant que tout le monde est au salon, tu livres enfin la refonte des commandes.',
      },
    ],
  },

  {
    id: 'bpi-bourse',
    months: [2, 8],
    category: 'Financement',
    speaker: 'Karim, chargé d’affaires Bpifrance',
    title: 'La Bourse French Tech est ouverte',
    text: 'Une subvention jusqu’à 30 000 € pour les jeunes startups. Le dossier est long et le jury sélectif.',
    note: 'Subvention : argent public qui ne se rembourse pas et ne coûte pas de capital.',
    choices: [
      {
        label: 'Monter le dossier',
        hints: ['Beaucoup de temps', 'Réponse dans quelques mois', 'Gros gain possible'],
        tags: ['fundraise'],
        effects: { team: -6 },
        delayed: [{ in: 3, id: 'bpi-result' }],
        text: 'Trois soirées sur le dossier, un budget prévisionnel refait quatre fois. Envoyé.',
      },
      {
        label: 'Pas le temps',
        hints: ['Tu restes focus'],
        tags: ['sales'],
        effects: { team: 2 },
        text: 'Tu préfères passer ce temps avec tes clients.',
      },
    ],
  },

  {
    id: 'hire-sales',
    months: [5, 14],
    category: 'Recrutement',
    speaker: 'Inès, commerciale expérimentée',
    title: 'Une commerciale veut te rejoindre',
    text: 'Inès a vendu des logiciels aux restaurants pendant 6 ans. Elle demande un CDI.',
    note: 'Un salarié coûte environ 1,5 fois son salaire brut, charges comprises.',
    choices: [
      {
        label: 'L’embaucher en CDI',
        hints: ['Charge fixe élevée chaque mois', 'Plus de ventes si ton produit convainc'],
        tags: ['recruit', 'sales'],
        effects: { hire: { role: 'sales', label: 'Inès, commerciale', cost: 3500 }, team: 4 },
        delayed: [{ in: 3, id: 'sales-review' }],
        text: 'Inès arrive lundi avec son carnet d’adresses. Ta masse salariale fait un bond.',
      },
      {
        label: 'Lui proposer du freelance à la commission',
        hints: ['Pas de charge fixe', 'Motivation incertaine'],
        tags: ['sales', 'cash'],
        outcomes: [
          {
            chance: { base: 0.2, pmf: 0.01 },
            effects: { clients: 2, cash: -500 },
            text: 'Elle accepte et signe 2 restaurants en un mois. Commission versée.',
          },
          { effects: {}, text: 'Elle refuse poliment. Elle rejoint un concurrent.' },
        ],
      },
      {
        label: 'Continuer à vendre toi-même',
        hints: ['Aucun coût', 'Fatigue'],
        tags: ['cash'],
        effects: { team: -4 },
        outcomes: [
          { chance: { base: 0.5 }, effects: { clients: 1 }, text: 'Tu signes un restaurant de plus entre deux réunions.' },
          { effects: {}, text: 'Pas le temps de prospecter ce mois-ci.' },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // URGENCES (déclenchées par le moteur, pas tirées au sort)

  {
    id: 'runway-alert',
    urgent: 'runway',
    months: [1, 18],
    category: 'Trésorerie',
    speaker: 'Ton expert-comptable',
    stage: 'alert',
    title: 'Il te reste moins de 2 mois de cash',
    text: 'À ce rythme, ton compte passe dans le rouge très bientôt. Il faut agir ce mois-ci.',
    note: 'Runway : nombre de mois avant de tomber à 0 €, si rien ne change.',
    choices: [
      {
        label: 'Licencier et couper les coûts',
        if: { minStaff: 1 },
        hints: ['Charges en forte baisse', 'Choc pour l’équipe'],
        tags: ['cash'],
        effects: { fire: 'all', team: -15 },
        text: 'Tu annonces les départs un lundi matin. Ton burn fond. L’ambiance aussi.',
      },
      {
        label: 'Couper les outils et abonnements',
        if: { maxStaff: 0 },
        hints: ['Petite économie', 'Le produit en souffre un peu'],
        tags: ['cash'],
        effects: { costs: -600, pmf: -2, team: -3 },
        text: 'Adieu le CRM premium et les serveurs surdimensionnés.',
      },
      {
        label: 'Mettre votre épargne perso',
        if: { notFlag: 'savingsUsed' },
        hints: ['Quelques mois de répit', 'Risque personnel'],
        tags: ['cash'],
        effects: { cash: 6000, team: -6, flags: { savingsUsed: true } },
        text: 'Ton associé et toi videz vos livrets. 6 000 € de plus, une pression de plus.',
      },
      {
        label: 'Appeler ta business angel',
        if: { flag: 'angel' },
        hints: ['Rallonge possible', 'Tu cèdes encore du capital'],
        tags: ['fundraise'],
        outcomes: [
          {
            chance: { base: 0.3, pmf: 0.01 },
            effects: { cash: 30000, equity: -6 },
            text: 'Elle remet 30 000 € au pot. « Dernière fois », précise-t-elle.',
          },
          { effects: { team: -4 }, text: 'Elle ne remettra pas un euro sans plus de traction.' },
        ],
      },
      {
        label: 'Tenir et espérer',
        if: { flag: 'savingsUsed', notFlag: 'angel' },
        hints: ['Aucun coût', 'Très risqué'],
        tags: ['cash'],
        effects: {},
        text: 'Tu relances tes prospects un par un. Il faut un miracle, ou une grosse signature.',
      },
    ],
  },

  {
    id: 'team-crisis',
    urgent: 'team',
    months: [1, 18],
    category: 'Équipe',
    speaker: 'Ton associé',
    stage: 'flash',
    title: 'Ton associé veut quitter la boîte',
    text: '« Je dors 5 heures par nuit depuis des mois. Je n’en peux plus. » Il pose sa démission sur ton bureau.',
    choices: [
      {
        label: 'Tout mettre en pause 2 semaines',
        hints: ['L’équipe récupère', 'Le produit et les ventes ralentissent'],
        tags: ['team'],
        effects: { team: 25, pmf: -3, clients: -1 },
        text: 'Vacances forcées pour tout le monde. Au retour, il reste.',
      },
      {
        label: 'Le convaincre de rester',
        hints: ['Résultat incertain'],
        tags: ['team'],
        outcomes: [
          { chance: { base: 0.5 }, effects: { team: 12 }, text: 'Une longue soirée, des promesses. Il reste. Pour l’instant.' },
          { effects: { team: -10, pmf: -4 }, text: 'Il part. Tu te retrouves seul avec tout le produit sur les épaules.' },
        ],
      },
      {
        label: 'Recruter du renfort',
        hints: ['Charge fixe en plus', 'L’équipe souffle'],
        tags: ['recruit', 'team'],
        effects: { hire: { role: 'dev', label: 'Renfort produit', cost: 3200 }, team: 15 },
        text: 'Un dev arrive en urgence. Ton associé reprend espoir.',
      },
    ],
  },

  {
    id: 'quiet-month',
    fallback: true,
    months: [1, 18],
    category: 'Mois calme',
    title: 'Un mois sans tempête',
    text: 'Pas de grosse décision ce mois-ci. Comment tu utilises ce temps ?',
    choices: [
      {
        label: 'Appeler tes clients',
        hints: ['Tu apprends', 'Un peu de fatigue'],
        tags: ['product'],
        effects: { pmf: 3, team: -2 },
        text: 'Dix appels, trois idées d’amélioration.',
      },
      {
        label: 'Prospecter',
        hints: ['Quelques leads'],
        tags: ['sales'],
        outcomes: [
          { chance: { base: 0.5 }, effects: { clients: 1, team: -2 }, text: 'Un restaurant de plus.' },
          { effects: { team: -2 }, text: 'Des rendez-vous, pas encore de signature.' },
        ],
      },
      {
        label: 'Souffler',
        hints: ['L’équipe récupère'],
        tags: ['team'],
        effects: { team: 6 },
        text: 'Un vrai week-end. Tout le monde revient avec le sourire.',
      },
    ],
  },
];
