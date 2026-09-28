// Formatage pour l'affichage. Espace simple comme séparateur de milliers (lisible partout).

export function eur(n) {
  const v = Math.round(n);
  const abs = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${v < 0 ? '-' : ''}${abs} €`;
}

export function signedEur(n) {
  return n > 0 ? `+${eur(n)}` : eur(n);
}

export function signed(n) {
  return n > 0 ? `+${n}` : `${n}`;
}

export function runwayLabel(r) {
  if (r === Infinity) return 'Cash stable';
  if (r >= 24) return '24+ mois';
  if (r < 1) return '< 1 mois';
  return `${Math.floor(r)} mois`;
}

// Mois où le cash passe sous zéro si rien ne change. `fromMonth` = premier mois pas encore clôturé.
export function zeroCashMonth(s, fromMonth) {
  const burn = Math.max(s.costs - s.mrr, 0);
  if (burn === 0) return null;
  return fromMonth + Math.floor(s.cash / burn);
}

const MENTOR_NAMES = { thomas: 'Thomas', robin: 'Robin' };

// Texte d'un événement : une chaîne, ou un objet par parcours { saas, bootstrap, deeptech, default }.
// Remplace {name} par le nom de la startup, {mentor} par le mentor du mois
// et {investor} par l'investisseur qui mène la levée.
export function fill(value, s = {}) {
  if (value === null || value === undefined) return value;
  const raw = typeof value === 'object' ? (value[s.path] ?? value.default ?? '') : value;
  const mentorId = s.current?.mentor || ((s.mentorTurn || 0) % 2 === 0 ? 'thomas' : 'robin');
  const investor = s.flags?.gaspardLead ? 'Gaspard' : 'Mathilde';
  return raw
    .replace(/\{name\}/g, s.name || 'Glane')
    .replace(/\{mentor\}/g, MENTOR_NAMES[mentorId])
    .replace(/\{investor\}/g, investor);
}

// Typographie française : espace insécable avant ? ! : ; » et après «, pour éviter les signes orphelins.
export function fr(text) {
  if (!text) return text;
  return text.replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ');
}
