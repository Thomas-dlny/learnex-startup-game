// Personnages récurrents. Les événements y font référence avec `speaker: 'mentor'`
// (Thomas et Robin se relaient) ou directement par leur nom.

export const MENTORS = [
  { id: 'thomas', name: 'Thomas', role: 'mentor EDHEC Entrepreneurs' },
  { id: 'robin', name: 'Robin', role: 'mentor EDHEC Entrepreneurs' },
];

export const GASPARD = { name: 'Gaspard', role: 'associé d’un fonds Seed' };

export const ADVICE_PER_RUN = 2;

// Conseils génériques quand l'événement n'a pas son propre `advice`.
// Le premier dont la condition colle l'emporte. Jamais la réponse : une question pour réfléchir.
export const GENERIC_ADVICE = [
  {
    test: (s, r) => r < 4,
    text: 'Regarde ton runway avant tout. Parmi ces options, laquelle te laisse encore en vie dans trois mois ?',
  },
  {
    test: (s) => s.team <= 40,
    text: 'Ton équipe est fatiguée. Une bonne décision prise par des gens épuisés reste une décision fragile.',
  },
  {
    test: (s) => s.pmf < 30,
    text: 'Tes clients te disent-ils déjà qu’ils ne pourraient plus s’en passer ? Si non, qu’est-ce qui t’aide à le savoir ?',
  },
  {
    test: (s) => s.staff.length === 0 && s.mrr > 3000,
    text: 'Tes revenus grossissent. Qui absorbe la charge si tu signes encore dix clients ?',
  },
  {
    test: () => true,
    text: 'Demande-toi ce que chaque option te coûte en cash, en énergie et en temps. Puis laquelle t’apprend le plus.',
  },
];
