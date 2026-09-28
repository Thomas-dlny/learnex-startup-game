import { ENDINGS } from '../game/endings.js';

export default function StartScreen({ records, saved, onStart, onResume }) {
  const unlocked = records.endings.filter((e) => ENDINGS[e]?.positive).length;
  const positiveTotal = Object.values(ENDINGS).filter((e) => e.positive).length;
  return (
    <main className="start">
      <div className="start-panel">
        <p className="start-kicker">Une Learnex EDHEC Entrepreneurs</p>
        <h1 className="start-title">Startup Incubation Game</h1>
        <p className="start-lede">
          Tu entres en incubation avec <strong>Glane</strong>, ton logiciel anti-gaspillage pour restaurants.
          10 000 € en banque, un MVP, deux fondateurs. Tu as 18 mois.
        </p>

        <dl className="start-rules">
          <div>
            <dt>Ton objectif</dt>
            <dd>Devenir rentable, lever avec de la traction, ou te faire racheter. Survivre ne suffit pas.</dd>
          </div>
          <div>
            <dt>Tes jauges</dt>
            <dd>Cash, runway, MRR, équipe, PMF. Cash sous 0 € ou équipe à bout : partie terminée.</dd>
          </div>
          <div>
            <dt>Chaque mois</dt>
            <dd>Une situation, 2 ou 3 choix. Certaines conséquences arrivent des mois plus tard.</dd>
          </div>
          <div>
            <dt>Tu vas perdre</dt>
            <dd>C’est prévu. Lis ton bilan, change de stratégie, relance. Une partie dure 5 à 10 minutes.</dd>
          </div>
        </dl>

        <div className="start-actions">
          <button type="button" className="btn-primary btn-xl" onClick={onStart} autoFocus>
            {records.totalRuns > 0 ? 'Lancer une nouvelle run' : 'Lancer mon incubation'}
          </button>
          {saved && (
            <button type="button" className="btn-ghost" onClick={onResume}>
              Reprendre la partie au mois {saved.month}
            </button>
          )}
        </div>

        {records.totalRuns > 0 && (
          <p className="start-records">
            <span>
              Runs jouées <strong>{records.totalRuns}</strong>
            </span>
            <span>
              Record de survie <strong>{records.bestMonths} mois</strong>
            </span>
            <span>
              Fins positives <strong>{unlocked}/{positiveTotal}</strong>
            </span>
          </p>
        )}
      </div>
    </main>
  );
}
