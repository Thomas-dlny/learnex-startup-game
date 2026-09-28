import { eur } from '../game/format.js';

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
