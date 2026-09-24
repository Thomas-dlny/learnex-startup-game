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
        text: 'Trois features livrées en un mois. Belle cadence. Reste à savoir si quelqu’un s’en sert.',
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

  {
    id: 'website-agency',
    months: [1, 6],
    category: 'Marketing',
    speaker: 'Agence Pixel & Pastis',
    title: 'Un site vitrine magnifique pour 5 000 €',
    text: 'Une agence te montre une maquette superbe : vidéo, animations, photos de chefs. « Votre image, c’est votre premier commercial. »',
    choices: [
      {
        label: 'Signer le devis',
        hints: ['Coût : 5 000 €', 'Très joli', 'Utile pour vendre ?'],
        tags: ['growth'],
        effects: { cash: -5000, team: 3 },
        delayed: [{ in: 2, id: 'site-result' }],
        text: 'Le site est splendide. Ton associé l’a partagé à toute sa famille.',
      },
      {
        label: 'Un template en un week-end',
        hints: ['Presque gratuit', 'Un week-end sacrifié'],
        tags: ['cash'],
        effects: { cash: -100, team: -4 },
        text: 'Un template à 79 €, deux nuits de réglages. C’est propre, c’est suffisant.',
      },
      {
        label: 'Garder ta landing page actuelle',
        hints: ['Zéro coût', 'Un peu moins crédible'],
        tags: ['cash', 'product'],
        effects: {},
        text: 'Tes clients viennent par le bouche-à-oreille. Aucun n’a jamais parlé du site.',
      },
    ],
  },

  {
    id: 'freelance-designer',
    months: [2, 7],
    category: 'Produit',
    speaker: 'Sofia, designer freelance',
    title: 'Ton onboarding fait fuir la moitié des inscrits',
    text: 'Sofia a regardé tes statistiques : un restaurant sur deux abandonne avant la fin de la configuration.',
    note: 'Onboarding : les premières minutes d’un nouvel utilisateur dans ton produit.',
    choices: [
      {
        label: 'Payer Sofia pour tout refaire',
        hints: ['Coût : 2 500 €', 'Produit plus simple à adopter'],
        tags: ['product'],
        effects: { cash: -2500, pmf: 7 },
        text: 'Trois écrans au lieu de onze. Les nouveaux inscrits vont jusqu’au bout.',
      },
      {
        label: 'Le refaire toi-même',
        hints: ['Gratuit', 'Beaucoup de temps', 'Résultat moyen'],
        tags: ['product'],
        effects: { team: -6, pmf: 3 },
        text: 'Tu passes dix jours sur Figma. C’est mieux, sans être génial.',
      },
      {
        label: 'Pas prioritaire',
        hints: ['Tu gardes ton cash'],
        tags: ['cash'],
        outcomes: [
          {
            if: { maxPmf: 30, minClients: 2 },
            effects: { clients: -1 },
            text: 'Un restaurant résilie : « Trop compliqué pour mes équipes. »',
          },
          { effects: {}, text: 'Tu notes le sujet dans ta liste. Elle s’allonge.' },
        ],
      },
    ],
  },

  {
    id: 'dev-freelance',
    months: [2, 8],
    category: 'Recrutement',
    speaker: 'Ton associé, seul sur le code',
    title: 'La roadmap déborde',
    text: 'Ton associé code seul, le soir et le week-end. Les demandes clients s’empilent.',
    note: 'Un salarié coûte environ 1,5 fois son salaire brut, charges comprises.',
    choices: [
      {
        label: 'Un dev freelance pour un mois',
        hints: ['Coût : 4 000 €', 'Le produit accélère', 'Qualité inconnue'],
        tags: ['product'],
        effects: { cash: -4000, pmf: 5, team: 3 },
        outcomes: [
          { chance: { base: 0.3 }, delayed: [{ in: 2, id: 'freelance-bug' }], text: 'Un mois de sprint, six fonctionnalités livrées. Le code est… rapide.' },
          { text: 'Un freelance carré. Six fonctionnalités livrées et documentées.' },
        ],
      },
      {
        label: 'Recruter un dev en CDI',
        hints: ['Charge fixe élevée chaque mois', 'Le produit progresse tous les mois'],
        tags: ['recruit', 'product'],
        effects: { hire: { role: 'dev', label: 'Développeuse', cost: 3800 }, team: 5 },
        text: 'Amina rejoint l’équipe. Ton associé dort enfin.',
      },
      {
        label: 'Tenir à deux',
        hints: ['Aucun coût', 'Fatigue'],
        tags: ['cash'],
        effects: { team: -5, pmf: 1 },
        text: 'Encore un mois de soirées pizza devant l’écran.',
      },
    ],
  },

  {
    id: 'intern',
    months: [2, 11],
    category: 'Recrutement',
    speaker: 'Tom, étudiant à l’EDHEC',
    title: 'Un stagiaire motivé frappe à ta porte',
    text: 'Tom cherche un stage de 6 mois en startup. Il est prêt à tout : prospection, support, tableaux Excel.',
    choices: [
      {
        label: 'Le prendre en stage',
        hints: ['Petit coût chaque mois', 'Des bras en plus', 'Il faut l’encadrer'],
        tags: ['recruit'],
        effects: { hire: { role: 'intern', label: 'Tom, stagiaire', cost: 700 }, team: 4 },
        delayed: [{ in: 6, id: 'intern-end' }],
        text: 'Tom arrive avec un carnet neuf et 40 questions.',
      },
      {
        label: 'Pas maintenant',
        hints: ['Rien ne change'],
        tags: ['cash'],
        effects: {},
        text: 'Tom trouve un stage dans une scale-up. Il te souhaite bon courage.',
      },
    ],
  },

  {
    id: 'meta-ads',
    months: [2, 10],
    category: 'Acquisition',
    speaker: 'Kevin, consultant growth',
    title: '« Avec 3 000 € de Meta Ads, je te ramène des clients »',
    text: 'Kevin a un plan : ciblage restaurateurs, vidéos courtes, landing page optimisée.',
    note: 'Meta Ads : publicités payantes sur Facebook et Instagram.',
    choices: [
      {
        label: 'Lancer 3 000 € de pub',
        hints: ['Coût : 3 000 €', 'Des clients rapidement', 'Resteront-ils ?'],
        tags: ['growth'],
        effects: { cash: -3000 },
        delayed: [{ in: 2, id: 'ads-churn' }],
        outcomes: [
          { chance: { base: 0.4, pmf: 0.01 }, effects: { clients: 5 }, text: 'Les clics pleuvent : 5 restaurants s’abonnent en trois semaines.' },
          { effects: { clients: 3 }, text: 'Beaucoup de clics, 3 abonnements. Le coût par client pique un peu.' },
        ],
      },
      {
        label: 'Tester avec 500 €',
        hints: ['Coût : 500 €', 'Tu apprends quels messages marchent'],
        tags: ['growth', 'product'],
        effects: { cash: -500, pmf: 3, clients: 1 },
        text: 'Le message « -30 % de gaspillage » bat tous les autres. Précieux pour la suite.',
      },
      {
        label: 'Pas de pub',
        hints: ['Tu gardes ton cash'],
        tags: ['cash'],
        effects: {},
        text: 'Kevin repart vexé. Il te propose un « audit gratuit » par mail chaque semaine.',
      },
    ],
  },

  {
    id: 'edhec-expert',
    months: [1, 9],
    category: 'Incubateur',
    speaker: 'Claire, experte pricing EDHEC Entrepreneurs',
    title: '2 heures avec une experte pricing',
    text: 'Claire accompagne les startups de l’incubateur sur leurs prix. Elle a un créneau cette semaine.',
    choices: [
      {
        label: 'Bloquer les 2 heures',
        hints: ['Un peu de temps', 'Tes prix vont bouger'],
        tags: ['product'],
        effects: { arpuPct: 20, mrrPct: 10, team: -1 },
        text: 'Verdict : tu vends trop peu cher. Nouveaux clients à 300 €, légère hausse pour les autres. Personne ne part.',
      },
      {
        label: 'Pas le temps ce mois-ci',
        hints: ['Tu restes focus sur tes clients'],
        tags: ['sales'],
        effects: { team: 1 },
        text: 'Claire te dit de revenir quand tu veux. Tu ne reviens pas.',
      },
    ],
  },

  {
    id: 'mentor-intro',
    months: [3, 12],
    category: 'Incubateur',
    speaker: 'Philippe, mentor EDHEC Entrepreneurs',
    title: '« Je peux te présenter quelqu’un »',
    text: 'Ton mentor a un carnet d’adresses bien rempli. Il te propose une introduction, une seule. Tu choisis.',
    choices: [
      {
        label: 'Un directeur achats de la restauration collective',
        hints: ['Piste corporate', 'Cycle de vente long'],
        tags: ['corporate'],
        delayed: [{ in: 2, id: 'mentor-corporate' }],
        effects: {},
        text: 'Philippe envoie un mail. Réponse : « Revenons-en après l’été. »',
      },
      {
        label: 'Une business angel de la foodtech',
        hints: ['Piste financement', 'Il faudra la convaincre'],
        tags: ['fundraise'],
        effects: { flags: { investorContact: true } },
        delayed: [{ in: 2, id: 'angel-meeting' }],
        text: 'Café prévu dans deux mois. Elle veut voir tes chiffres.',
      },
      {
        label: 'Un restaurateur étoilé très influent',
        hints: ['Visibilité dans le milieu', 'Pas de revenus directs'],
        tags: ['growth'],
        outcomes: [
          { chance: { base: 0.3, pmf: 0.01 }, effects: { clients: 3, pmf: 2 }, text: 'Il adopte Glane et en parle à ses amis chefs. 3 nouveaux clients.' },
          { effects: { pmf: 3 }, text: 'Il ne s’abonne pas, mais ses critiques affûtent ton produit.' },
        ],
      },
    ],
  },

  {
    id: 'unhappy-client',
    months: [3, 10],
    when: { minClients: 2 },
    category: 'Client mécontent',
    speaker: 'Nadia, gérante de pizzeria',
    title: '« Votre logiciel a planté pendant le rush »',
    text: 'Samedi soir, 150 couverts, Glane ne répondait plus. Nadia veut résilier.',
    choices: [
      {
        label: 'Tout lâcher pour corriger',
        hints: ['Charge importante', 'Tu comprends le problème'],
        tags: ['product'],
        effects: { team: -5, pmf: 4 },
        text: 'Correctif livré en 48 h. Nadia reste et te signale deux autres bugs.',
      },
      {
        label: 'Lui offrir un mois',
        hints: ['Coût : un mois d’abonnement', 'Relation préservée'],
        tags: ['sales'],
        effects: { cash: -250 },
        text: 'Nadia accepte le geste. Le bug, lui, est toujours là.',
      },
      {
        label: 'La laisser partir',
        hints: ['Tu gardes ton temps'],
        tags: ['cash'],
        effects: { clients: -1 },
        delayed: [{ in: 1, id: 'bad-review' }],
        text: 'Nadia résilie. Tu te dis qu’on ne peut pas plaire à tout le monde.',
      },
    ],
  },

  {
    id: 'salon-pro',
    months: [3, 10],
    category: 'Salon',
    title: 'Le Salon de la Restauration de Lyon cherche des exposants',
    text: 'Deux jours, 12 000 professionnels de la restauration. Exactement ta cible.',
    choices: [
      {
        label: 'Prendre un stand',
        hints: ['Coût : 2 500 €', 'Tes clients sont là', 'Deux jours intenses'],
        tags: ['growth', 'sales'],
        effects: { cash: -2500, team: -4 },
        outcomes: [
          { chance: { base: 0.3, pmf: 0.01 }, effects: { clients: 4 }, text: 'Ta démo en live fait mouche. 4 restaurants signent sur place.' },
          { effects: { clients: 2 }, text: 'Beaucoup de passage, 2 signatures. Les autres « vont réfléchir ».' },
        ],
      },
      {
        label: 'Prospecter dans les allées',
        hints: ['Coût : 200 €', 'Fatigue'],
        tags: ['sales'],
        effects: { cash: -200, team: -3 },
        outcomes: [
          { chance: { base: 0.5 }, effects: { clients: 1 }, text: 'Un badge visiteur, 30 conversations, 1 client.' },
          { text: 'Les exposants n’aiment pas trop qu’on démarche leurs visiteurs.' },
        ],
      },
      {
        label: 'Passer ton tour',
        hints: ['L’équipe souffle'],
        tags: ['cash'],
        effects: { team: 2 },
        text: 'Tu suis le salon sur LinkedIn, depuis ton canapé.',
      },
    ],
  },

  {
    id: 'cofounder-tension',
    months: [4, 10],
    category: 'Équipe',
    speaker: 'Ton associé',
    title: 'Désaccord sur la cible',
    text: 'Il veut viser les chaînes de restaurants. Toi, les indépendants. Le ton monte en réunion.',
    choices: [
      {
        label: 'Deux jours de séminaire pour trancher',
        hints: ['Petit coût', 'L’équipe se ressoude'],
        tags: ['team'],
        effects: { cash: -600, team: 10, pmf: 2 },
        text: 'Un gîte, un tableau blanc, des données clients. Vous tombez d’accord : les indépendants d’abord.',
      },
      {
        label: 'Trancher seul, tu es le CEO',
        hints: ['Décision rapide', 'Tensions'],
        tags: ['product'],
        effects: { team: -8, pmf: 3 },
        delayed: [{ in: 3, id: 'tension-returns' }],
        text: 'Tu tranches. Il acquiesce, les bras croisés.',
      },
      {
        label: 'Laisser couler',
        hints: ['Aucun effort', 'Le sujet reviendra ?'],
        tags: ['cash'],
        effects: {},
        delayed: [{ in: 3, id: 'tension-returns' }],
        text: 'Vous changez de sujet. Le malaise reste.',
      },
    ],
  },

  {
    id: 'pret-honneur',
    months: [3, 9],
    category: 'Financement',
    speaker: 'Réseau de prêt d’honneur',
    title: '20 000 € à taux zéro, sans garantie',
    text: 'Un comité de chefs d’entreprise prête aux fondateurs prometteurs. Il faut pitcher en 10 minutes.',
    note: 'Prêt d’honneur : prêt personnel au fondateur, sans intérêts, remboursé après quelques années.',
    choices: [
      {
        label: 'Pitcher devant le comité',
        hints: ['Préparation', 'Réponse le jour même'],
        tags: ['fundraise'],
        effects: { team: -3 },
        outcomes: [
          {
            chance: { base: 0.3, pmf: 0.012, mrr: 0.1 },
            effects: { cash: 20000, flags: { honorLoan: true } },
            text: 'Accordé. 20 000 € sur ton compte, et un parrain chef d’entreprise en bonus.',
          },
          { effects: { team: -2 }, text: 'Le comité te demande de revenir avec tes premiers clients payants.' },
        ],
      },
      {
        label: 'Pas de dette',
        hints: ['Rien à rembourser'],
        tags: ['cash'],
        effects: {},
        text: 'Tu préfères ne rien devoir à personne.',
      },
    ],
  },

  {
    id: 'big-prospect-feature',
    months: [3, 11],
    when: { maxPmf: 70 },
    category: 'Gros prospect',
    speaker: 'Directeur des opérations, chaîne Les Bonnes Tables',
    title: '« Je signe si vous ajoutez cette fonctionnalité »',
    text: '12 restaurants d’un coup. Mais il veut un module de planning du personnel. Rien à voir avec ton produit.',
    choices: [
      {
        label: 'La développer',
        hints: ['Gros client', 'Ta roadmap déraille'],
        tags: ['sales', 'corporate'],
        effects: { team: -6, pmf: -3, clients: 1, mrr: 900 },
        text: 'Contrat signé : 1 150 €/mois. Ton produit a maintenant une fonctionnalité que personne d’autre n’utilise.',
      },
      {
        label: 'Refuser et rester focus',
        hints: ['Tu protèges ton produit', 'Client perdu'],
        tags: ['product'],
        effects: { pmf: 3 },
        text: 'Tu refuses poliment. Ton produit reste simple, tes autres clients te remercient sans le savoir.',
      },
      {
        label: 'Proposer une option payante',
        hints: ['Résultat incertain'],
        tags: ['sales'],
        outcomes: [
          {
            chance: { base: 0.25, pmf: 0.01 },
            effects: { clients: 1, mrr: 1200, team: -3 },
            text: 'Il accepte de payer le développement. 1 450 €/mois, et le module financé.',
          },
          { effects: {}, text: 'Trop cher pour lui. Il reviendra peut-être.' },
        ],
      },
    ],
  },

  {
    id: 'local-press',
    months: [2, 9],
    category: 'Presse',
    speaker: 'Journaliste, quotidien régional',
    title: 'Un journaliste veut écrire sur Glane',
    text: 'Sujet : les jeunes pousses qui luttent contre le gaspillage. Une heure d’interview et une photo.',
    choices: [
      {
        label: 'Accepter l’interview',
        hints: ['Un peu de temps', 'Visibilité locale'],
        tags: ['growth'],
        effects: { team: -1 },
        outcomes: [
          { chance: { base: 0.45 }, effects: { clients: 2 }, text: 'L’article sort en page 3. Deux restaurateurs t’appellent le lendemain.' },
          { effects: { team: 3 }, text: 'L’article sort en page 14. Ta mère l’a encadré.' },
        ],
      },
      {
        label: 'Décliner',
        hints: ['Tu gardes ton focus'],
        tags: ['product'],
        effects: { pmf: 1 },
        text: 'Le journaliste interviewe ton concurrent à la place.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // ACTE 2 : TROUVER DE LA TRACTION (mois 7 à 12, certains dès le mois 5)

  {
    id: 'raise-prices',
    months: [6, 14],
    when: { minClients: 5 },
    category: 'Pricing',
    speaker: 'Claire, experte pricing EDHEC Entrepreneurs',
    title: 'Tes clients ne discutent jamais le prix',
    text: '« Si personne ne négocie, c’est que tu es trop bas. » Claire te pousse à monter tes prix de 30 %.',
    choices: [
      {
        label: '+30 % pour tout le monde',
        hints: ['Plus de revenus', 'Certains clients partiront'],
        tags: ['sales', 'cash'],
        outcomes: [
          {
            if: { minPmf: 45 },
            effects: { arpuPct: 30, clientsPct: -8, mrrPct: 30 },
            text: 'Deux clients râlent, presque tous restent. Ton produit est devenu indispensable.',
          },
          {
            effects: { arpuPct: 30, clientsPct: -30, mrrPct: 30 },
            text: 'Un tiers de tes clients part. Ton produit n’était pas encore indispensable.',
          },
        ],
      },
      {
        label: '+30 % pour les nouveaux clients',
        hints: ['Aucun risque pour tes clients actuels', 'Effet progressif'],
        tags: ['sales'],
        effects: { arpuPct: 30 },
        text: 'Les nouveaux contrats passent à un tarif plus élevé. Personne ne bronche.',
      },
      {
        label: 'Garder tes prix',
        hints: ['Aucun risque'],
        tags: ['cash'],
        effects: { team: 1 },
        text: 'Tu préfères ne pas faire de vagues.',
      },
    ],
  },

  {
    id: 'hire-dev',
    months: [6, 15],
    category: 'Recrutement',
    speaker: 'Yanis, développeur senior',
    title: 'Un dev senior est disponible',
    text: 'Yanis a 8 ans d’expérience et adore ton sujet. Il n’est pas donné.',
    note: 'Un salarié coûte environ 1,5 fois son salaire brut, charges comprises.',
    choices: [
      {
        label: 'Embaucher Yanis en CDI',
        hints: ['Charge fixe élevée', 'Produit plus solide chaque mois'],
        tags: ['recruit', 'product'],
        effects: { hire: { role: 'dev', label: 'Yanis, dev senior', cost: 4500 }, team: 6 },
        text: 'Yanis arrive et refait l’architecture en deux semaines. Impressionnant, et cher.',
      },
      {
        label: 'Prendre un dev junior à la place',
        hints: ['Charge fixe', 'Moins cher', 'À encadrer'],
        tags: ['recruit'],
        effects: { hire: { role: 'dev', label: 'Dev junior', cost: 2800 }, team: -2 },
        delayed: [{ in: 3, id: 'junior-bug' }],
        text: 'Lucas sort d’école. Motivé, rapide, parfois trop.',
      },
      {
        label: 'Pas de recrutement',
        hints: ['Tu préserves ton cash', 'Le produit avance lentement'],
        tags: ['cash'],
        effects: { team: -3 },
        text: 'Yanis rejoint une scale-up. Ton associé soupire.',
      },
    ],
  },

  {
    id: 'hotel-poc',
    months: [6, 14],
    when: { minPmf: 25 },
    category: 'Client corporate',
    speaker: 'Directrice RSE, groupe hôtelier Arcane',
    stage: 'breaking',
    title: 'Un groupe hôtelier veut tester ton produit',
    text: 'Un POC de 3 mois dans 15 restaurants d’hôtels. Le potentiel est énorme, mais ton équipe devra presque tout arrêter.',
    note: 'POC (Proof of Concept) : test payant du produit chez un client, avant un vrai contrat.',
    choices: [
      {
        label: 'Accepter le POC',
        hints: ['Potentiel commercial élevé', 'Charge importante'],
        tags: ['corporate'],
        effects: { cash: 5000, team: -10 },
        delayed: [{ in: 3, id: 'poc-result' }],
        text: '5 000 € versés au démarrage. Réunions, comités, badges d’accès : bienvenue dans les grands groupes.',
      },
      {
        label: 'Rester focus',
        hints: ['Moins de revenus potentiels', 'Produit mieux protégé'],
        tags: ['product'],
        effects: { team: 3, pmf: 3 },
        text: 'Tu déclines. Tes restaurants profitent de toute ton attention.',
      },
    ],
  },

  {
    id: 'tender',
    months: [7, 15],
    when: { minPmf: 30 },
    category: 'Appel d’offres',
    title: 'La métropole lance un appel d’offres pour ses cantines',
    text: '80 cantines scolaires, contrat de 3 ans. Le dossier fait 140 pages.',
    note: 'Appel d’offres : mise en concurrence publique. Dossier lourd, réponse lente.',
    choices: [
      {
        label: 'Répondre à l’appel d’offres',
        hints: ['Dossier très lourd', 'Contrat énorme si tu gagnes', 'Réponse dans 3 mois'],
        tags: ['corporate'],
        effects: { team: -8 },
        delayed: [{ in: 3, id: 'tender-result' }],
        text: 'Trois semaines de mémoire technique. Dossier déposé à 11 h 58 pour une clôture à midi.',
      },
      {
        label: 'Passer ton tour',
        hints: ['Tu restes sur tes restaurants'],
        tags: ['product'],
        effects: { team: 2 },
        text: 'Tu laisses les marchés publics aux grands éditeurs. Pour l’instant.',
      },
    ],
  },

  {
    id: 'pivot',
    months: [6, 11],
    when: { maxPmf: 40 },
    category: 'Pivot',
    speaker: 'Léa, coach EDHEC Entrepreneurs',
    stage: 'flash',
    title: 'Les cantines d’entreprise adorent ton produit',
    text: 'Tes données sont claires : 3 cantines d’entreprise utilisent Glane deux fois plus que tes restaurants. Et elles paient mieux.',
    note: 'Pivot : changer de cible ou de produit à partir de ce que le marché t’apprend.',
    choices: [
      {
        label: 'Pivoter vers les cantines',
        hints: ['Tu perds une grosse partie de tes clients', 'Marché plus clair'],
        tags: ['product'],
        effects: { clientsPct: -60, pmf: 22, team: -6, arpuPct: 40, flags: { pivoted: true } },
        text: 'Tu annonces le pivot à tes restaurants. Beaucoup partent. Les cantines, elles, signent vite.',
      },
      {
        label: 'Rester sur les restaurants',
        hints: ['Tu gardes tes clients', 'Le doute reste'],
        tags: ['sales'],
        effects: { team: -2 },
        text: 'Tu restes fidèle à ta vision de départ.',
      },
      {
        label: 'Tester les deux en parallèle',
        hints: ['Double charge de travail', 'Tu apprends vite'],
        tags: ['product'],
        effects: { team: -10, pmf: 8 },
        text: 'Deux cibles, deux discours, deux fois plus de réunions. Mais tu y vois plus clair.',
      },
    ],
  },

  {
    id: 'competitor-arrives',
    months: [6, 14],
    category: 'Concurrence',
    title: 'Un concurrent copie ton produit, 30 % moins cher',
    text: 'Même promesse, même couleur de logo, prix cassé. Tes clients reçoivent leurs mails de prospection.',
    choices: [
      {
        label: 'Baisser tes prix',
        hints: ['Tu gardes tes clients', 'Moins de revenus'],
        tags: ['sales'],
        effects: { arpuPct: -20, mrrPct: -20 },
        text: 'Tu t’alignes. Tes clients restent, ton MRR fond.',
      },
      {
        label: 'Miser sur la qualité du produit',
        hints: ['Charge produit', 'Tes clients jugeront'],
        tags: ['product'],
        effects: { team: -4, pmf: 5 },
        outcomes: [
          { if: { maxPmf: 44 }, effects: { clients: -2 }, text: 'Deux clients partent tester le concurrent. Les autres attendent tes nouveautés.' },
          { text: 'Tes clients restent. Ils veulent la qualité, pas le prix.' },
        ],
      },
      {
        label: 'L’ignorer',
        hints: ['Aucun effort'],
        tags: ['cash'],
        outcomes: [
          { if: { minPmf: 50 }, text: 'Tes clients ne le remarquent même pas. Ton produit fait la différence.' },
          { effects: { clientsPct: -20 }, text: 'Le concurrent rafle un client sur cinq.' },
        ],
      },
    ],
  },

  {
    id: 'angel-offer',
    months: [6, 13],
    when: { minMrr: 1250, notFlag: 'angel' },
    category: 'Business angel',
    speaker: 'Hélène, ancienne dirigeante de la restauration',
    title: '60 000 € contre 12 % de ta boîte',
    text: 'Hélène a entendu parler de Glane par un client. Elle veut investir, vite.',
    note: 'Business angel : particulier qui investit son argent dans des startups contre des parts.',
    choices: [
      {
        label: 'Accepter',
        hints: ['Beaucoup de runway', 'Tu cèdes du capital'],
        tags: ['fundraise'],
        effects: { cash: 60000, equity: -12, flags: { angel: true } },
        text: 'Virement reçu. Hélène rejoint ton board et t’appelle tous les lundis.',
      },
      {
        label: 'Négocier à 8 %',
        hints: ['Résultat incertain'],
        tags: ['fundraise'],
        outcomes: [
          {
            chance: { base: 0.2, pmf: 0.008, mrr: 0.05 },
            effects: { cash: 60000, equity: -8, flags: { angel: true } },
            text: 'Elle accepte. Tu gardes 4 % de plus.',
          },
          { effects: {}, text: 'Elle se retire. « Revenez quand vous aurez plus de traction. »' },
        ],
      },
      {
        label: 'Refuser, rester indépendant',
        hints: ['Tu gardes 100 % de ta boîte'],
        tags: ['cash'],
        effects: {},
        text: 'Tu préfères avancer avec tes propres revenus.',
      },
    ],
  },

  {
    id: 'bank-loan',
    months: [7, 15],
    category: 'Financement',
    speaker: 'Ton conseiller bancaire',
    title: 'Ta banque te propose un prêt de 50 000 €',
    text: 'Garanti par Bpifrance, remboursé sur 4 ans. La banque veut voir tes revenus récurrents.',
    note: 'Un prêt se rembourse chaque mois : ta charge fixe augmente.',
    choices: [
      {
        label: 'Demander le prêt',
        hints: ['Beaucoup de cash', 'Remboursement chaque mois', 'La banque regarde tes revenus'],
        tags: ['fundraise'],
        outcomes: [
          {
            if: { minMrr: 2000 },
            effects: { cash: 50000, costs: 1150, flags: { loan: true } },
            text: 'Prêt accordé. Tu rembourseras 1 150 € chaque mois.',
          },
          { effects: { team: -2 }, text: 'Refusé : « Revenez avec 2 000 € de revenus mensuels. »' },
        ],
      },
      {
        label: 'Pas de dette',
        hints: ['Aucune charge en plus'],
        tags: ['cash'],
        effects: {},
        text: 'Tu remercies ton conseiller. Il te laisse sa carte.',
      },
    ],
  },

  {
    id: 'founder-salary',
    months: [8, 12],
    when: { notFlag: 'foundersPaid' },
    weight: 2,
    category: 'Équipe',
    speaker: 'Ton associé',
    title: 'Vous ne vous payez pas depuis 8 mois',
    text: 'Ton associé veut louer un appartement. Le propriétaire demande trois fiches de paie.',
    choices: [
      {
        label: 'Vous verser un salaire',
        hints: ['Charge fixe : 3 600 €/mois', 'Équipe soulagée'],
        tags: ['team'],
        effects: { costs: 3600, team: 15, flags: { foundersPaid: true } },
        text: 'Premier salaire : 1 500 € net chacun. Vous fêtez ça au kebab d’en bas.',
      },
      {
        label: 'Tenir encore quelques mois',
        hints: ['Cash préservé', 'Fatigue qui s’accumule'],
        tags: ['cash'],
        effects: { team: -8 },
        delayed: [{ in: 3, id: 'salary-fatigue' }],
        text: 'Vous serrez les dents. Encore des pâtes au dîner.',
      },
    ],
  },

  {
    id: 'bad-buzz',
    months: [7, 15],
    when: { minClients: 5 },
    category: 'Réputation',
    stage: 'flash',
    title: 'Un client te clashe sur LinkedIn',
    text: '« Glane a perdu mes commandes de la semaine. » 200 000 vues en deux jours.',
    choices: [
      {
        label: 'Répondre publiquement et corriger',
        hints: ['Exposé mais transparent', 'Grosse charge'],
        tags: ['product'],
        effects: { team: -5, pmf: 3 },
        outcomes: [
          { chance: { base: 0.5 }, effects: { clients: 2 }, text: 'Ta réponse honnête est saluée. Deux restaurants te contactent.' },
          { text: 'La tempête passe. Le bug est corrigé.' },
        ],
      },
      {
        label: 'Faire le dos rond',
        hints: ['Aucun effort', 'Réputation abîmée ?'],
        tags: ['cash'],
        effects: { clients: -2 },
        text: 'Le silence est interprété comme un aveu. Deux clients partent.',
      },
      {
        label: 'Appeler un avocat',
        hints: ['Coût : 1 500 €', 'Effet incertain'],
        tags: ['cash'],
        effects: { cash: -1500, team: -2, clients: -1 },
        text: 'Le post est retiré. Mais une capture circule déjà partout.',
      },
    ],
  },

  {
    id: 'outage',
    months: [6, 17],
    when: { minClients: 8 },
    category: 'Incident',
    stage: 'alert',
    title: 'Panne géante un vendredi soir',
    text: 'Plus rien ne marche en plein service. Ton téléphone vibre sans arrêt.',
    choices: [
      {
        label: 'Nuit blanche pour tout réparer',
        hints: ['Grosse fatigue', 'Clients rassurés'],
        tags: ['product'],
        effects: { team: -10 },
        outcomes: [
          { if: { role: 'dev' }, effects: { team: 5 }, text: 'Ta dev prend le relais. La nuit est courte mais partagée.' },
          { text: 'Tu répares à 4 h du matin. Tu dors dans le bureau.' },
        ],
      },
      {
        label: 'Dédommager tous tes clients',
        hints: ['Coût variable', 'Relation préservée'],
        tags: ['sales'],
        outcomes: [
          { if: { minMrr: 5000 }, effects: { cash: -3000 }, text: 'Une semaine offerte à tout le monde. 3 000 € de moins, zéro résiliation.' },
          { effects: { cash: -800 }, text: 'Une semaine offerte à tout le monde. 800 € de moins, zéro résiliation.' },
        ],
      },
      {
        label: 'Communiquer et attendre lundi',
        hints: ['Aucun coût', 'Des clients partiront'],
        tags: ['cash'],
        effects: { clientsPct: -12 },
        text: 'Lundi, tout remarche. Quelques clients ne sont plus là pour le voir.',
      },
    ],
  },

  {
    id: 'investor-prep',
    months: [7, 14],
    when: { notFlag: 'investorReady' },
    category: 'Incubateur',
    speaker: 'Léa, coach EDHEC Entrepreneurs',
    title: 'Le programme levée de fonds de l’incubateur ouvre',
    text: 'Six semaines pour préparer ton deck, tes chiffres et ton pitch face à des investisseurs.',
    note: 'Deck : présentation qui résume ta startup pour les investisseurs.',
    choices: [
      {
        label: 'Suivre le programme',
        hints: ['Beaucoup de temps', 'Levée mieux préparée'],
        tags: ['fundraise'],
        effects: { team: -5, flags: { investorReady: true } },
        text: 'Ton deck passe de 34 à 12 slides. Tu connais enfin tes chiffres par cœur.',
      },
      {
        label: 'Pas maintenant',
        hints: ['Tu restes sur ton produit'],
        tags: ['product'],
        effects: { pmf: 2, team: 1 },
        text: 'Les levées attendront. Tes clients, non.',
      },
    ],
  },

  {
    id: 'content-marketing',
    months: [4, 14],
    category: 'Acquisition',
    title: 'Poster sur LinkedIn trois fois par semaine ?',
    text: 'Un fondateur de ton batch jure que ça lui ramène un client par semaine.',
    choices: [
      {
        label: 'Te lancer',
        hints: ['Du temps chaque semaine', 'Effet lent'],
        tags: ['growth'],
        effects: { team: -5 },
        delayed: [{ in: 3, id: 'content-effect' }],
        text: 'Premier post : « Ce que 15 restaurateurs m’ont appris sur le gaspillage. » 41 likes.',
      },
      {
        label: 'Pas pour toi',
        hints: ['Tu gardes ton temps'],
        tags: ['product'],
        effects: { team: 2 },
        text: 'Tu laisses les posts inspirants aux autres.',
      },
    ],
  },

  {
    id: 'partnership',
    months: [7, 15],
    when: { minPmf: 30 },
    category: 'Partenariat',
    speaker: 'Responsable partenariats, Tiroir (logiciels de caisse)',
    title: 'Un éditeur de caisses veut intégrer Glane',
    text: 'Leurs 40 commerciaux vendraient Glane avec leurs caisses. Ils prennent 30 % de commission.',
    choices: [
      {
        label: 'Signer le partenariat',
        hints: ['Nouveau canal de vente', 'Marge plus faible', 'Intégration technique'],
        tags: ['sales', 'corporate'],
        effects: { team: -4 },
        delayed: [{ in: 2, id: 'partner-result' }],
        text: 'Contrat signé. Ton associé passe le mois sur leur API.',
      },
      {
        label: 'Refuser',
        hints: ['Tu gardes la main sur tes ventes'],
        tags: ['product'],
        effects: { pmf: 1 },
        text: 'Tu préfères maîtriser ta relation client.',
      },
    ],
  },

  {
    id: 'referral',
    months: [5, 13],
    when: { minClients: 5 },
    category: 'Acquisition',
    title: 'Et si tes clients te recommandaient ?',
    text: 'Idée : un mois offert pour chaque restaurant parrainé.',
    choices: [
      {
        label: 'Lancer le parrainage',
        hints: ['Petit coût', 'Dépend de la satisfaction de tes clients'],
        tags: ['growth'],
        outcomes: [
          { if: { minPmf: 45 }, effects: { clients: 4, cash: -1000 }, text: 'Tes clients adorent : 4 filleuls en un mois.' },
          { effects: { clients: 1, cash: -250 }, text: 'Un seul parrainage. Tes clients ne sont pas encore fans.' },
        ],
      },
      {
        label: 'Pas maintenant',
        hints: ['Aucun coût'],
        tags: ['cash'],
        effects: {},
        text: 'Idée notée pour plus tard.',
      },
    ],
  },

  {
    id: 'office',
    months: [6, 12],
    category: 'Équipe',
    title: 'Quitter l’open space de l’incubateur ?',
    text: 'Un bureau privé se libère à deux rues. 1 200 € par mois, une vraie porte, une vraie machine à café.',
    choices: [
      {
        label: 'Prendre le bureau',
        hints: ['Charge fixe chaque mois', 'L’équipe respire'],
        tags: ['team'],
        effects: { costs: 1200, team: 8 },
        text: 'Vous accrochez votre logo sur la porte. Photo LinkedIn obligatoire.',
      },
      {
        label: 'Rester à l’incubateur',
        hints: ['Gratuit', 'Un peu bruyant'],
        tags: ['cash'],
        effects: { team: -1 },
        outcomes: [
          { chance: { base: 0.4 }, effects: { pmf: 2 }, text: 'Au café, un autre fondateur te donne une idée produit géniale.' },
          { text: 'Casque antibruit et réunions dans le couloir. Ça fait le job.' },
        ],
      },
    ],
  },

  {
    id: 'late-payment',
    months: [6, 15],
    when: { minClients: 6 },
    category: 'Trésorerie',
    title: 'Ton plus gros client paie avec 60 jours de retard',
    text: '1 500 € de factures en attente. Il « attend la validation de la compta ».',
    choices: [
      {
        label: 'Relancer fermement',
        hints: ['Tu récupères ton argent', 'Relation tendue'],
        tags: ['cash'],
        outcomes: [
          { chance: { base: 0.6 }, text: 'Il paie sous 48 h. Sans sourire.' },
          { effects: { clients: -1 }, text: 'Il paie… et résilie dans la foulée.' },
        ],
      },
      {
        label: 'Attendre patiemment',
        hints: ['Relation préservée', 'Ton cash attend'],
        tags: ['sales'],
        effects: { cash: -1500 },
        delayed: [{ in: 2, id: 'late-payment-paid' }],
        text: 'Tu avances la trésorerie. Chiffre d’affaires ne veut pas dire cash sur le compte.',
      },
    ],
  },

  {
    id: 'vat-surprise',
    months: [6, 14],
    category: 'Trésorerie',
    speaker: 'Ton expert-comptable',
    title: 'Régularisation de TVA : 3 000 €',
    text: 'Une erreur de déclaration de l’an dernier. Il faut payer. Tu as le choix du rythme.',
    choices: [
      {
        label: 'Payer tout de suite',
        hints: ['Coût : 3 000 €', 'On n’en parle plus'],
        tags: ['cash'],
        effects: { cash: -3000 },
        text: 'Payé. Ton comptable te conseille un logiciel de facturation. Ironique.',
      },
      {
        label: 'Demander un échéancier',
        hints: ['Paiement étalé', 'Un peu de paperasse'],
        tags: ['cash'],
        effects: { cash: -1000, team: -2 },
        delayed: [
          { in: 1, id: 'vat-installment' },
          { in: 2, id: 'vat-installment' },
        ],
        text: 'Accordé : 3 fois 1 000 €. Ton runway respire.',
      },
    ],
  },

  {
    id: 'demo-day',
    months: [10, 14],
    category: 'Incubateur',
    speaker: 'Léa, coach EDHEC Entrepreneurs',
    stage: 'breaking',
    title: 'Demo Day : 5 minutes devant 200 personnes',
    text: 'Investisseurs, corporates, presse. Chaque startup du batch pitche sur scène.',
    choices: [
      {
        label: 'Pitcher sur scène',
        hints: ['Préparation intense', 'Visibilité forte'],
        tags: ['fundraise', 'growth'],
        effects: { team: -4 },
        outcomes: [
          {
            chance: { base: 0.2, pmf: 0.006, mrr: 0.04 },
            effects: { flags: { investorContact: true, investorReady: true }, clients: 1 },
            text: 'Standing ovation. Deux fonds demandent ton deck, un restaurateur signe dans la salle.',
          },
          { effects: { flags: { investorContact: true } }, text: 'Bon pitch, salle polie. Un investisseur garde ta carte.' },
        ],
      },
      {
        label: 'Laisser ta place',
        hints: ['Tu gardes ton énergie'],
        tags: ['product'],
        effects: { team: 3 },
        text: 'Tu regardes les autres pitcher depuis le fond de la salle.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // ACTE 3 : ACCÉLÉRER (mois 13 à 18, certains dès le mois 11)

  {
    id: 'seed-round',
    months: [11, 17],
    when: { notFlag: 'raised' },
    weight: 4,
    category: 'Levée de fonds',
    speaker: 'Léa, coach EDHEC Entrepreneurs',
    title: 'Des fonds VC acceptent de te rencontrer',
    text: 'Trois fonds Seed veulent voir tes chiffres. Une levée, c’est deux mois de rendez-vous et beaucoup de refus.',
    note: 'Seed : première levée auprès de fonds, souvent entre 500 000 € et 2 M€.',
    choices: [
      {
        label: 'Lancer la levée',
        hints: ['Deux mois de rendez-vous', 'Tout dépend de ta traction', 'Équipe moins disponible'],
        tags: ['fundraise'],
        effects: { team: -8 },
        delayed: [{ in: 2, id: 'seed-result' }],
        text: 'Deck envoyé, agenda rempli. Tu répètes ton pitch sous la douche.',
      },
      {
        label: 'Pas maintenant, grandir d’abord',
        hints: ['Tu restes sur tes clients'],
        tags: ['product'],
        effects: { team: 2, pmf: 2 },
        text: 'Tu préfères lever plus tard, avec de meilleurs chiffres.',
      },
    ],
  },

  {
    id: 'international',
    months: [12, 17],
    when: { minMrr: 4000 },
    category: 'International',
    speaker: 'Javier, distributeur à Madrid',
    title: 'Un distributeur veut Glane en Espagne',
    text: 'Madrid compte 15 000 restaurants. Javier a le réseau, toi le produit. Il faut traduire, adapter, voyager.',
    choices: [
      {
        label: 'Te lancer en Espagne',
        hints: ['Coût : 8 000 €', 'Équipe dispersée', 'Gros marché'],
        tags: ['growth'],
        effects: { cash: -8000, team: -8 },
        delayed: [{ in: 3, id: 'intl-result' }],
        text: 'Tu passes deux semaines à Madrid. Ton espagnol progresse, ton produit aussi.',
      },
      {
        label: 'Consolider la France',
        hints: ['Focus', 'Opportunité manquée ?'],
        tags: ['product'],
        effects: { pmf: 3 },
        text: 'La France d’abord. L’Espagne attendra.',
      },
    ],
  },

  {
    id: 'big-account',
    months: [12, 17],
    when: { minPmf: 45 },
    category: 'Grand compte',
    speaker: 'Directeur achats, chaîne Brasserie Nationale',
    stage: 'breaking',
    title: 'Une chaîne de 200 restaurants veut Glane',
    text: '60 000 € par an. Condition : aucune chaîne concurrente chez toi pendant 2 ans.',
    note: 'Exclusivité : tu t’interdis de vendre à certains clients.',
    choices: [
      {
        label: 'Signer avec l’exclusivité',
        hints: ['Énorme contrat', 'Tu dépends d’un seul client'],
        tags: ['corporate'],
        effects: { clients: 1, mrr: 4750, team: -8 },
        delayed: [{ in: 4, id: 'big-account-risk' }],
        text: 'Contrat signé : 5 000 €/mois. Ton plus gros client, de loin.',
      },
      {
        label: 'Négocier sans exclusivité',
        hints: ['Résultat incertain'],
        tags: ['corporate', 'sales'],
        outcomes: [
          {
            chance: { base: 0.2, pmf: 0.006 },
            effects: { clients: 1, mrr: 3750, team: -5 },
            text: 'Ils acceptent sans exclusivité, pour un prix un peu plus bas. 4 000 €/mois.',
          },
          { text: 'Ils partent chez un concurrent qui accepte l’exclusivité.' },
        ],
      },
      {
        label: 'Refuser',
        hints: ['Tu gardes ta liberté'],
        tags: ['product'],
        effects: { team: 2 },
        text: 'Tu préfères 200 petits clients à un seul gros.',
      },
    ],
  },

  {
    id: 'competitor-raise',
    months: [11, 17],
    category: 'Concurrence',
    stage: 'flash',
    title: 'Ton concurrent vient de lever 20 M€',
    text: 'Il annonce 50 recrutements et une campagne télé. Tes clients t’envoient l’article.',
    choices: [
      {
        label: 'Accélérer : doubler ton budget marketing',
        hints: ['Charge fixe en hausse', 'Course à la croissance'],
        tags: ['growth'],
        effects: { costs: 3000, clients: 3 },
        text: 'Pubs, salons, sponsoring. Tu gagnes 3 clients et un budget mensuel bien plus lourd.',
      },
      {
        label: 'Te concentrer sur ta niche',
        hints: ['Tu protèges tes clients fidèles'],
        tags: ['product'],
        effects: { pmf: 5 },
        outcomes: [
          { if: { maxPmf: 49 }, effects: { clientsPct: -15 }, text: 'Quelques clients partent chez lui. Tes fidèles restent.' },
          { text: 'Tes clients restent : il vise les chaînes, toi les indépendants.' },
        ],
      },
      {
        label: 'Lui proposer un rapprochement',
        hints: ['Coup de poker'],
        tags: ['corporate'],
        outcomes: [
          {
            if: { minPmf: 55, minMrr: 5000 },
            chance: { base: 0.35 },
            effects: { flags: { acquisitionInterest: true } },
            text: 'Leur CEO te rappelle. « Parlons-en au prochain trimestre. »',
          },
          { text: 'Pas de réponse. Tu as au moins attiré leur attention.' },
        ],
      },
    ],
  },

  {
    id: 'manager-crisis',
    months: [12, 18],
    when: { minStaff: 3 },
    category: 'Management',
    title: 'L’équipe grandit, les process craquent',
    text: 'Personne ne sait qui fait quoi. Deux personnes ont codé la même fonctionnalité sans le savoir.',
    choices: [
      {
        label: 'Recruter une head of ops',
        hints: ['Charge fixe', 'Organisation solide'],
        tags: ['recruit', 'team'],
        effects: { hire: { role: 'ops', label: 'Head of ops', cost: 4000 }, team: 14 },
        text: 'Julie arrive, installe trois rituels et un tableau de bord. Le calme revient.',
      },
      {
        label: 'Instaurer des rituels toi-même',
        hints: ['Temps de réunion', 'Effet moyen'],
        tags: ['team'],
        effects: { team: 6, pmf: -1 },
        text: 'Point d’équipe le lundi, démo le vendredi. Ça aide.',
      },
      {
        label: 'Ça va passer',
        hints: ['Aucun effort'],
        tags: ['cash'],
        effects: { team: -10 },
        text: 'Ça ne passe pas. Les tensions montent.',
      },
    ],
  },

  {
    id: 'key-employee',
    months: [9, 18],
    when: { role: 'dev' },
    category: 'Équipe',
    stage: 'flash',
    title: 'Ta meilleure dev reçoit une offre d’un grand groupe',
    text: 'Salaire +40 %, tickets resto, télétravail. Elle hésite.',
    note: 'BSPCE : bons qui permettent aux salariés d’acheter des parts de la startup à prix fixé.',
    choices: [
      {
        label: 'Faire une contre-offre salariale',
        hints: ['Charge fixe en hausse'],
        tags: ['team'],
        effects: { costs: 800, team: 3 },
        text: 'Elle reste. Ta masse salariale grimpe encore.',
      },
      {
        label: 'Lui offrir des BSPCE',
        hints: ['Tu cèdes un peu de capital', 'Motivation long terme'],
        tags: ['team'],
        effects: { equity: -2, team: 6 },
        text: 'Elle devient actionnaire. Elle parle désormais de « notre boîte ».',
      },
      {
        label: 'La laisser partir',
        hints: ['Charges en baisse', 'Perte de savoir-faire'],
        tags: ['cash'],
        effects: { fire: 'dev', team: -8, pmf: -4 },
        text: 'Pot de départ un peu triste. Personne ne connaît son code aussi bien qu’elle.',
      },
    ],
  },

  {
    id: 'burnout-warning',
    months: [11, 18],
    when: { maxTeam: 60 },
    category: 'Équipe',
    speaker: 'Ton associé',
    title: 'Ton associé s’endort en réunion client',
    text: 'Douze mois à 70 heures par semaine. Tout le monde le voit, personne n’en parle.',
    choices: [
      {
        label: 'Imposer une semaine de congés',
        hints: ['L’équipe récupère', 'Une semaine plus lente'],
        tags: ['team'],
        effects: { team: 12, pmf: -1 },
        text: 'Il part une semaine sans ordinateur. Il revient avec des idées.',
      },
      {
        label: 'Un freelance pour le soulager',
        hints: ['Coût : 3 000 €', 'Charge allégée'],
        tags: ['team'],
        effects: { cash: -3000, team: 8 },
        text: 'Un freelance reprend le support client. Ton associé souffle.',
      },
      {
        label: 'Serrer les dents',
        hints: ['Aucun coût', 'Risqué'],
        tags: ['cash'],
        effects: { team: -6 },
        text: 'Encore un effort. Ça finira bien par passer.',
      },
    ],
  },

  {
    id: 'national-press',
    months: [12, 18],
    category: 'Presse',
    speaker: 'Journaliste, quotidien économique national',
    title: 'La presse éco veut ton portrait',
    text: '« Les startups qui s’attaquent au gaspillage alimentaire. » Tu serais la photo principale.',
    choices: [
      {
        label: 'Accepter',
        hints: ['Une demi-journée', 'Visibilité nationale'],
        tags: ['growth'],
        effects: { team: -2 },
        outcomes: [
          {
            chance: { base: 0.25, pmf: 0.008 },
            effects: { clients: 3, flags: { investorContact: true } },
            text: 'L’article tourne partout. 3 restaurants t’écrivent, un fonds aussi.',
          },
          { effects: { clients: 1 }, text: 'Belle photo, bel article. Un client, et beaucoup de likes.' },
        ],
      },
      {
        label: 'Décliner',
        hints: ['Tu restes sur l’opérationnel'],
        tags: ['product'],
        effects: { pmf: 1 },
        text: 'Pas le moment. Tu as des livraisons à faire.',
      },
    ],
  },

  {
    id: 'ai-feature',
    months: [10, 18],
    category: 'Produit',
    title: 'Tout le monde ajoute de l’IA. Et toi ?',
    text: 'Tes concurrents affichent « IA » partout. Tes clients te posent la question.',
    choices: [
      {
        label: 'Intégrer une vraie IA de prévision',
        hints: ['Coût : 6 000 €', 'Résultat incertain'],
        tags: ['product'],
        effects: { cash: -6000, team: -3 },
        outcomes: [
          { chance: { base: 0.3, pmf: 0.006 }, effects: { pmf: 8 }, text: 'Tes prévisions de commandes deviennent bluffantes. Tes clients jettent 20 % de moins.' },
          { effects: { pmf: 1 }, text: 'Démo impressionnante, usage faible. Tes clients voulaient surtout que ça marche.' },
        ],
      },
      {
        label: 'Écrire « IA » sur ton site, sans rien changer',
        hints: ['Aucun coût', 'Effet marketing'],
        tags: ['growth'],
        effects: { clients: 2, pmf: -2 },
        text: 'Deux nouveaux clients. Ils cherchent l’IA dans le produit. Ils ne la trouvent pas.',
      },
      {
        label: 'Rester sur ce qui marche',
        hints: ['Tu gardes ton cap'],
        tags: ['product'],
        effects: { pmf: 2 },
        text: 'Ton produit ne fait pas d’IA. Il fait gagner de l’argent. Tes clients préfèrent.',
      },
    ],
  },

  {
    id: 'acquisition-offer',
    months: [13, 18],
    when: { minPmf: 65, minMrr: 10000 },
    weight: 1,
    category: 'Rachat',
    speaker: 'CEO d’un grand éditeur de logiciels pour la restauration',
    stage: 'breaking',
    title: 'Un leader du marché veut racheter Glane',
    text: 'Il propose de racheter 100 % de ta startup. Ton équipe serait intégrée, ton produit aussi.',
    note: 'Exit : vente de la startup. Rare, surtout après 18 mois.',
    choices: [
      {
        label: 'Accepter l’offre',
        hints: ['Fin de l’aventure', 'Tu encaisses le fruit de ton travail'],
        tags: ['corporate'],
        end: 'exit',
        text: 'Signature chez l’avocat. Tu serres la main de ton associé. Incroyable.',
      },
      {
        label: 'Refuser et continuer',
        hints: ['Tu crois à plus grand'],
        tags: ['product'],
        effects: { team: 5 },
        text: 'Tu déclines. Ton équipe est fière. La pression aussi monte d’un cran.',
      },
    ],
  },

  {
    id: 'acquisition-offer-early',
    months: [13, 18],
    when: { flag: 'acquisitionInterest', minPmf: 55, minMrr: 6000 },
    weight: 2,
    category: 'Rachat',
    speaker: 'CEO de ton concurrent',
    stage: 'breaking',
    title: 'Ton concurrent veut te racheter',
    text: 'Ton coup de poker a marché. Il préfère t’acheter que te combattre.',
    note: 'Exit : vente de la startup. Rare, surtout après 18 mois.',
    choices: [
      {
        label: 'Accepter l’offre',
        hints: ['Fin de l’aventure', 'Tu encaisses le fruit de ton travail'],
        tags: ['corporate'],
        end: 'exit',
        text: 'Deal signé. Ton ancien concurrent devient ton nouveau patron.',
      },
      {
        label: 'Refuser et continuer',
        hints: ['Tu veux gagner par toi-même'],
        tags: ['product'],
        effects: { team: 3 },
        text: 'Tu refuses. La guerre continue.',
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
          { effects: { team: -10, pmf: -4 }, text: 'Il part. Tout le produit repose désormais sur tes épaules.' },
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
