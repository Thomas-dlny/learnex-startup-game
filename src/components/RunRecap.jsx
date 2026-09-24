import { useEffect, useRef } from 'react';
import { eur, fr } from '../game/format.js';
import { ENDINGS } from '../game/endings.js';
import { CONFIG } from '../game/config.js';

function RunHistory({ runs }) {
  const last = runs.slice(-10);
  if (last.length < 2) return null;
  return (
    <section className="report-block report-history">
      <h2>Tes dernières runs</h2>
      <ol className="history-bars" aria-label="Mois survécus par run">
        {last.map((r, i) => (
          <li key={i} className={`${ENDINGS[r.type]?.positive ? 'is-positive' : ''}${i === last.length - 1 ? ' is-current' : ''}`}>
            <span className="bar" style={{ height: `${(r.monthsSurvived / CONFIG.months) * 100}%` }} />
            <span className="bar-value">{r.monthsSurvived}</span>
            <span className="visually-hidden">
              Run {r.runNumber} : {r.monthsSurvived} mois, {ENDINGS[r.type]?.kicker}
            </span>
          </li>
        ))}
      </ol>
      <p className="history-legend">Mois survécus. En or : fins positives.</p>
    </section>
  );
}

export default function RunRecap({ recap, records, onRestart, onHome }) {
  const title = useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    title.current?.focus({ preventScroll: true });
  }, []);
  const { ending, stats, cause, profile } = recap;

  return (
    <main className="recap">
      <article className={`report ending-${recap.type}`}>
        <header className="report-head">
          <p className="report-run">RUN #{recap.runNumber}</p>
          <p className="report-kicker">{ending.kicker}</p>
          <h1 className="report-title" ref={title} tabIndex={-1}>
            {ending.title}
          </h1>
          <p className="report-profile">
            <span className="profile-name">« {profile.name} »</span>
            <span className="profile-line">{profile.line}</span>
          </p>
        </header>

        <section className="report-survival">
          <p className="survival-number">
            {recap.monthsSurvived}
            <span> mois</span>
          </p>
          <p className="survival-compare">
            {recap.previousBest === null && 'Ta première run. Le record à battre, c’est celui-là.'}
            {recap.previousBest !== null && recap.newRecord && (
              <>
                Record précédent : {recap.previousBest} mois
                <br />
                <strong>Nouveau record : {recap.monthsSurvived} mois</strong>
              </>
            )}
            {recap.previousBest !== null && !recap.newRecord && <>Ton record : {recap.previousBest} mois</>}
          </p>
        </section>

        <dl className="report-stats">
          <div>
            <dt>Cash final</dt>
            <dd>{eur(stats.cash)}</dd>
          </div>
          <div>
            <dt>MRR</dt>
            <dd>{eur(stats.mrr)}</dd>
          </div>
          <div>
            <dt>Clients</dt>
            <dd>{stats.clients}</dd>
          </div>
          <div>
            <dt>PMF</dt>
            <dd>{stats.pmf}</dd>
          </div>
          <div>
            <dt>Équipe</dt>
            <dd>{stats.team}</dd>
          </div>
          <div>
            <dt>Capital détenu</dt>
            <dd>{stats.equity} %</dd>
          </div>
        </dl>

        <section className="report-block report-cause">
          <h2>{recap.positive ? 'Ce qui a fait la différence' : 'Cause principale'}</h2>
          <p className="cause-title">{fr(cause.title)}</p>
          <p>{fr(cause.text)}</p>
        </section>

        <section className="report-block">
          <h2>Ce que tu avais bien fait</h2>
          <p>{fr(recap.strength)}</p>
        </section>

        {recap.keyDecisions.length > 0 && (
          <section className="report-block">
            <h2>Tes décisions marquantes</h2>
            <ol className="decisions">
              {recap.keyDecisions.map((d) => (
                <li key={`${d.month}-${d.eventId}`}>
                  <span className="decision-month">M{d.month}</span>
                  <span>
                    {fr(d.title)} <strong>{fr(d.choice)}</strong>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <RunHistory runs={records.runs} />

        <div className="report-actions">
          <button type="button" className="btn-primary btn-xl" onClick={onRestart}>
            RECOMMENCER
          </button>
          <button type="button" className="btn-link" onClick={onHome}>
            Retour à l’accueil
          </button>
        </div>
      </article>
    </main>
  );
}
