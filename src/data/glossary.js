// Glossaire des mots de startup, affiché en infobulle (composant StartupTerm).
//
// Pour ajouter un mot : une entrée { term, def, match }.
//   term   titre affiché dans l'infobulle
//   def    une phrase, compréhensible par un élève de 15 ans
//   match  formes reconnues dans les textes (insensible à la casse sauf les sigles)

export const GLOSSARY = [
  { term: 'Cash', def: 'L’argent disponible sur le compte de ta startup. Sous 0 €, elle ne peut plus payer ses factures.', match: ['cash', 'trésorerie'] },
  { term: 'Burn', def: 'L’argent que ta startup perd chaque mois : tes charges moins tes revenus.', match: ['burn net', 'burn'] },
  { term: 'Runway', def: 'Le nombre de mois avant d’arriver à 0 €, si rien ne change.', match: ['runway'] },
  { term: 'MRR', def: 'Monthly Recurring Revenue : l’argent que tes abonnements rapportent chaque mois.', match: ['MRR'] },
  { term: 'ARR', def: 'Le MRR multiplié par 12 : ce que tes abonnements rapportent sur un an.', match: ['ARR'] },
  { term: 'PMF', def: 'Product-Market Fit : à quel point tes clients ont vraiment besoin de ton produit. Plus il est haut, plus il se vend seul.', match: ['PMF', 'Product-Market Fit'] },
  { term: 'MVP', def: 'Minimum Viable Product : une première version simple du produit, faite pour apprendre vite avec de vrais clients.', match: ['MVP'] },
  { term: 'POC', def: 'Proof of Concept : un test payant chez un grand client, avant de signer un vrai contrat.', match: ['POC'] },
  { term: 'Pivot', def: 'Changer de cible ou de produit parce que le marché t’a appris quelque chose.', match: ['pivot', 'pivoter'] },
  { term: 'Churn', def: 'La part de tes clients qui arrêtent leur abonnement chaque mois.', match: ['churn'] },
  { term: 'Seed', def: 'La première vraie levée de fonds d’une startup, souvent entre 500 000 € et 2 M€.', match: ['Seed'] },
  { term: 'VC', def: 'Venture Capital : des fonds qui investissent dans des startups en échange de parts, en espérant qu’elles grandissent très vite.', match: ['VC', 'fonds VC'] },
  { term: 'Term sheet', def: 'La proposition écrite d’un investisseur : combien il met, pour quel pourcentage de ta boîte.', match: ['term sheet'] },
  { term: 'Business angel', def: 'Une personne qui investit son propre argent dans une jeune startup, souvent avec ses conseils en bonus.', match: ['business angel'] },
  { term: 'Bootstrap', def: 'Grandir sans investisseurs, en finançant la startup avec ses propres revenus.', match: ['bootstrap', 'bootstrappée'] },
  { term: 'Levée de fonds', def: 'Faire entrer des investisseurs au capital : ils apportent de l’argent, tu leur donnes des parts.', match: ['levée de fonds', 'levée'] },
  { term: 'Subvention', def: 'De l’argent public donné à ta startup, que tu ne rembourses pas.', match: ['subvention'] },
  { term: 'Prêt d’honneur', def: 'Un prêt sans intérêts accordé au fondateur, remboursé après quelques années.', match: ['prêt d’honneur'] },
  { term: 'Bpifrance', def: 'La banque publique qui finance les startups françaises : subventions, prêts, garanties.', match: ['Bpifrance'] },
  { term: 'Appel d’offres', def: 'Un grand client met plusieurs entreprises en concurrence. Dossier lourd, réponse lente.', match: ['appel d’offres'] },
  { term: 'Onboarding', def: 'Les premières minutes d’un nouveau client dans ton produit. S’il se perd, il part.', match: ['onboarding'] },
  { term: 'CDI', def: 'Un contrat sans date de fin. Un salarié coûte environ 1,5 fois son salaire brut, charges comprises.', match: ['CDI'] },
  { term: 'Freelance', def: 'Une personne indépendante payée à la mission, sans contrat de travail.', match: ['freelance'] },
  { term: 'BSPCE', def: 'Des bons qui permettent à un salarié de devenir actionnaire de la startup à un prix fixé.', match: ['BSPCE'] },
  { term: 'Deck', def: 'La présentation d’une quinzaine de slides qui résume ta startup pour les investisseurs.', match: ['deck'] },
  { term: 'Exit', def: 'La vente de ta startup à une autre entreprise. Rare, surtout après 18 mois.', match: ['exit'] },
  { term: 'Exclusivité', def: 'Tu t’engages à ne pas vendre à certains concurrents de ton client.', match: ['exclusivité'] },
  { term: 'Valorisation', def: 'Le prix de ta startup aux yeux des investisseurs. Plus elle est haute, moins tu cèdes de parts.', match: ['valorisation'] },
  { term: 'Meta Ads', def: 'Les publicités payantes sur Facebook et Instagram.', match: ['Meta Ads'] },
  { term: 'Demo Day', def: 'Le grand jour où chaque startup de l’incubateur pitche devant investisseurs et partenaires.', match: ['Demo Day'] },
  { term: 'Pitch', def: 'Présenter ta startup en quelques minutes pour convaincre.', match: ['pitch', 'pitcher'] },
  { term: 'Corporate', def: 'Un grand groupe. Gros budgets, décisions lentes.', match: ['corporate'] },
  { term: 'SaaS', def: 'Software as a Service : un logiciel en ligne vendu par abonnement mensuel.', match: ['SaaS'] },
  { term: 'Deeptech', def: 'Une startup qui repose sur une vraie avancée technique ou scientifique. Plus long à développer, plus dur à copier.', match: ['deeptech'] },
  { term: 'Brevet', def: 'Un titre officiel qui interdit aux autres de copier ton invention pendant 20 ans.', match: ['brevet'] },
  { term: 'CIR', def: 'Crédit d’impôt recherche : l’État rembourse une partie de tes dépenses de R&D.', match: ['CIR', 'crédit d’impôt recherche'] },
  { term: 'R&D', def: 'Recherche et développement : le travail pour inventer et mettre au point ta technologie.', match: ['R&D'] },
  { term: 'Pilote', def: 'Un premier déploiement réel chez un client industriel, pour prouver la technologie avant un contrat.', match: ['pilote'] },
  { term: 'Seuil de rentabilité', def: 'Le MRR à atteindre pour payer toutes tes charges et un salaire aux fondateurs.', match: ['seuil de rentabilité'] },
  { term: 'Charges', def: 'Tout ce que ta startup paie chaque mois : salaires, outils, loyer, remboursements.', match: ['charges'] },
];

const SIGLE = /^[A-Z&]+$/;

// Une seule expression régulière pour repérer tous les termes dans un texte.
// Les formes les plus longues passent d'abord (« burn net » avant « burn »).
// Cash, charges et seuil sont expliqués par le HUD et le tuto : pas de soulignement dans les récits.
const HUD_ONLY = new Set(['Cash', 'Charges', 'Seuil de rentabilité', 'Corporate', 'Pitch']);
const forms = GLOSSARY.filter((g) => !HUD_ONLY.has(g.term))
  .flatMap((g) => g.match.map((m) => ({ form: m, entry: g })))
  .sort((a, b) => b.form.length - a.form.length);
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const TERM_PATTERN = new RegExp(
  `(?<![\\p{L}\\d])(${forms.map((f) => escape(f.form)).join('|')})(?![\\p{L}\\d])`,
  'giu',
);

export function findTerm(word) {
  const hit = forms.find((f) => (SIGLE.test(f.form) ? f.form === word : f.form.toLowerCase() === word.toLowerCase()));
  return hit ? hit.entry : null;
}

export function termByName(name) {
  return GLOSSARY.find((g) => g.term.toLowerCase() === name.toLowerCase()) || findTerm(name);
}

// Découpe un texte en morceaux : chaînes simples et { text, entry } pour les termes.
// `seen` évite de souligner deux fois le même terme sur une même carte.
export function splitTerms(text, seen = new Set()) {
  if (!text) return [];
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(TERM_PATTERN)) {
    const entry = findTerm(m[0]);
    if (!entry || seen.has(entry.term)) continue;
    seen.add(entry.term);
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ text: m[0], entry });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
