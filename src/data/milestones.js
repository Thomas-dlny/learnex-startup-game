// Jalons : petites victoires célébrées pendant la run et cochées d'une run à l'autre.
// `test` reçoit l'état du jeu et renvoie vrai quand le jalon est atteint.

export const MILESTONES = [
  { id: 'first-client', icon: '🤝', label: 'Premier client', test: (s) => s.clients >= 1 },
  { id: 'mrr-1k', icon: '💶', label: '1 000 € de MRR', test: (s) => s.mrr >= 1000 },
  { id: 'first-hire', icon: '👋', label: 'Premier recrutement', test: (s) => s.stats.hires.length > 0 },
  { id: 'clients-10', icon: '🔟', label: '10 clients', test: (s) => s.clients >= 10 },
  { id: 'pmf-50', icon: '🎯', label: 'Produit adopté (PMF 50)', test: (s) => s.pmf >= 50 },
  { id: 'first-corporate', icon: '🏢', label: 'Premier corporate', test: (s) => Boolean(s.flags.corporateClient) },
  { id: 'grant', icon: '🏛️', label: 'Financement non dilutif', test: (s) => Boolean(s.flags.grant || s.flags.honorLoan) },
  { id: 'founders-paid', icon: '🧾', label: 'Premier salaire des fondateurs', test: (s) => Boolean(s.flags.foundersPaid) },
  { id: 'first-profit', icon: '📈', label: 'Premier mois rentable', test: (s) => s.profitStreak >= 1 },
  { id: 'one-year', icon: '🕯️', label: 'Un an tenu', test: (s) => s.month >= 12 && s.phase === 'result' && !s.ending },
  { id: 'raised', icon: '🚀', label: 'Levée signée', test: (s) => Boolean(s.flags.raised) },
  { id: 'mrr-10k', icon: '🏆', label: '10 000 € de MRR', test: (s) => s.mrr >= 10000 },
];

export function milestoneById(id) {
  return MILESTONES.find((m) => m.id === id);
}
