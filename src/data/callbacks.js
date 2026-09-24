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
];
