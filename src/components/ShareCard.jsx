import { eur } from '../game/format.js';
import { ENDINGS, headlineOf } from '../game/endings.js';
import { PATHS } from '../data/paths.js';

// Transforme une run de l'historique (localStorage) en données de carte.
// Les runs des anciennes versions n'ont ni nom ni parcours : on retombe sur SaaS et Glane.
export function cardFromRun(run) {
  const path = PATHS[run.path] || PATHS.saas;
  const name = run.name || path.defaultName;
  const stats = { clients: 0, mrr: 0, pmf: 0, ...run.stats };
  const ending = ENDINGS[run.type] || ENDINGS.cash;
  return {
    runNumber: run.runNumber,
    pathLabel: run.pathLabel || path.label,
    name,
    ending,
    positive: ending.positive,
    monthsSurvived: run.monthsSurvived,
    stats,
    profile: { name: run.profile?.name || 'L’Équilibriste' },
    headline: run.headline || headlineOf({ name, month: run.monthsSurvived, team: stats.team ?? 50, flags: {}, path: path.id }, run.type),
  };
}

// Texte copié dans le presse-papier, à coller dans une conversation.
export function shareText(recap) {
  const { stats } = recap;
  return [
    `${recap.headline}`,
    `RUN #${recap.runNumber} · ${recap.pathLabel} · ${recap.ending.kicker}`,
    `${recap.monthsSurvived} mois · ${stats.clients} clients · ${eur(stats.mrr)} de MRR · PMF ${stats.pmf}/100`,
    `Profil : ${recap.profile.name}`,
    'The Runway Game, EDHEC Entrepreneurs',
  ].join('\n');
}

// Carte de résultat, pensée pour une capture d'écran.
export default function ShareCard({ recap }) {
  const { stats } = recap;
  return (
    <figure className={`share-card${recap.positive ? ' is-positive' : ''}`} aria-label="Carte de résultat">
      <p className="share-top">
        <span>RUN #{recap.runNumber}</span>
        <span>{recap.pathLabel}</span>
      </p>
      <p className="share-name">{recap.name}</p>
      <p className="share-ending">{recap.ending.kicker}</p>
      <dl className="share-stats">
        <div>
          <dt>Mois</dt>
          <dd>{recap.monthsSurvived}</dd>
        </div>
        <div>
          <dt>Clients</dt>
          <dd>{stats.clients}</dd>
        </div>
        <div>
          <dt>MRR</dt>
          <dd>{eur(stats.mrr)}</dd>
        </div>
        <div>
          <dt>PMF</dt>
          <dd>{stats.pmf}</dd>
        </div>
      </dl>
      <figcaption>
        <span>« {recap.profile.name} »</span>
        <span>EDHEC Entrepreneurs</span>
      </figcaption>
    </figure>
  );
}
