// News affichées dans le bandeau ACTU.
//   mood : 'morose' | 'normal' | 'euphorique' → change l'humeur du marché quand la news sort
//   mood : null → simple brève d'ambiance, sans effet
//
// Effets du marché (voir config.js) : croissance x0,8 (morose) ou x1,2 (euphorique),
// et chances de levée ou de vente corporate modifiées dans certains événements.

export const NEWS = [
  { id: 'vc-cautious', mood: 'morose', text: 'Les investisseurs deviennent plus prudents. Les levées Seed ralentissent.' },
  { id: 'corporate-freeze', mood: 'morose', text: 'Les grands groupes gèlent leurs budgets innovation jusqu’à nouvel ordre.' },
  { id: 'restaurants-crisis', mood: 'morose', text: 'Hausse des prix de l’énergie : les restaurateurs repoussent leurs achats de logiciels.' },
  { id: 'sector-hot', mood: 'euphorique', text: 'Les investisseurs s’intéressent soudain énormément à la foodtech anti-gaspillage.' },
  { id: 'law-waste', mood: 'euphorique', text: 'Nouvelle loi anti-gaspillage : les restaurants doivent mesurer leurs pertes. Ton marché s’anime.' },
  { id: 'acquisitions', mood: 'euphorique', text: 'Trois startups foodtech rachetées en un mois. Les fonds cherchent la suivante.' },
  { id: 'stable', mood: 'normal', text: 'Le marché se stabilise. Ni euphorie, ni panique.' },
  { id: 'funds-back', mood: 'normal', text: 'Les fonds reprennent leurs rendez-vous, prudemment.' },

  { id: 'flavor-coffee', mood: null, text: 'La machine à café de l’incubateur est encore en panne. Productivité en berne.' },
  { id: 'flavor-cbinsights', mood: null, text: 'Étude après étude, « pas de besoin marché » arrive en tête des causes d’échec des startups.' },
  { id: 'flavor-linkedin', mood: null, text: 'Un fondateur annonce son 100e client sur LinkedIn. Tout le monde like, personne ne demande le churn.' },
  { id: 'flavor-demoday', mood: null, text: 'Demo Day de l’incubateur dans quelques mois : les pitchs se préparent déjà.' },
  { id: 'flavor-cash', mood: null, text: 'Rappel d’un expert EDHEC Entrepreneurs : « Le cash, c’est l’oxygène. Le reste vient après. »' },
];
