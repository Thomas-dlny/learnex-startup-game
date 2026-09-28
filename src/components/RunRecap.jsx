import { useEffect, useRef, useState } from 'react';
import { eur, fr } from '../game/format.js';
import { ENDINGS } from '../game/endings.js';
import { CONFIG } from '../game/config.js';
import ShareCard, { shareText, cardFromRun } from './ShareCard.jsx';

// Carte de résultat, avec l'historique des dernières runs : un clic sur une barre
// affiche la carte de cette run. Par défaut, la run qui vient de se terminer.
function ResultCards({ recap, runs }) {
  const last = runs.slice(-10);
  const [selected, setSelected] = useState(last.length - 1);
  const [copied, setCopied] = useState(false);
  const isCurrent = selected === last.length - 1 || last.length === 0;
  const card = isCurrent ? recap : cardFromRun(last[selected]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText(card));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const pick = (i) => {
    setSelected(i);
    setCopied(false);
  };

  return (
    <section className="report-block report-cards">
      <h2>{last.length >= 2 ? 'Tes dernières runs' : 'Ta carte de résultat'}</h2>
      <div className="cards-layout">
        {last.length >= 2 && (
          <div className="history">
            <ol className="history-bars" aria-label="Mois survécus par run. Choisis une run pour voir sa carte.">
              {last.map((r, i) => (
                <li key={i} className={`${ENDINGS[r.type]?.positive ? 'is-positive' : ''}${i === last.length - 1 ? ' is-current' : ''}`}>
                  <button
                    type="button"
                    className={`history-bar${i === selected ? ' is-selected' : ''}`}
                    aria-pressed={i === selected}
                    onClick={() => pick(i)}
                  >
                    <span className="bar-value">{r.monthsSurvived}</span>
                    <span className="bar" style={{ height: `${(r.monthsSurvived / CONFIG.months) * 100}%` }} />
                    <span className="bar-run" aria-hidden="true">
                      #{r.runNumber}
                    </span>
                    <span className="visually-hidden">
                      Run {r.runNumber} : {r.monthsSurvived} mois, {ENDINGS[r.type]?.kicker}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="history-legend">Mois survécus. En or : fins positives. Clique sur une run pour voir sa carte.</p>
          </div>
        )}
        <div className="card-slot">
          <ShareCard recap={card} key={card.runNumber} />
          <button type="button" className="btn-ghost share-copy" onClick={copy}>
            {copied ? 'Copié, à toi de le partager' : isCurrent ? 'Copier mon résultat' : `Copier la run #${card.runNumber}`}
          </button>
        </div>
      </div>
    </section>
  );
}

function Story({ story }) {
  return (
    <section className="report-block">
      <h2>L’histoire de ta run</h2>
      <ol className="story">
        {story.map((e, i) => (
          <li key={i} className={`story-${e.kind}${e.positive ? ' is-positive' : ''}`}>
            <span className="story-month">M{e.month}</span>
            <span className="story-dot" aria-hidden="true">
              {e.icon || ''}
            </span>
            <span className="story-body">
              <strong>{fr(e.title)}</strong>
              {e.detail && <span>{fr(e.detail)}</span>}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function RunRecap({ recap, records, onRestart, onReplay, onHome }) {
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
          <p className="report-run">
            RUN #{recap.runNumber} · {recap.pathLabel}
          </p>
          <p className="report-kicker">{ending.kicker}</p>
          <h1 className="report-title" ref={title} tabIndex={-1}>
            {fr(recap.headline)}
          </h1>
          {!recap.positive && recap.wins.length > 0 && (
            <div className="report-wins">
              <p>Mais tu as réussi à :</p>
              <ul>
                {recap.wins.map((w) => (
                  <li key={w.id}>
                    <span aria-hidden="true">✓</span> {w.label}
                    {w.isNew && <em>nouveau</em>}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
            {recap.newMrrRecord && (
              <>
                <br />
                <strong>Record de MRR : {eur(stats.mrr)}</strong>
              </>
            )}
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

        <Story story={recap.story} />

        <section className="report-block report-next">
          <h2>À tester à la prochaine run</h2>
          <p>{fr(recap.nextTry)}</p>
        </section>

        <ResultCards recap={recap} runs={records.runs} />

        <div className="report-actions">
          <button type="button" className="btn-primary btn-xl" onClick={onRestart}>
            CRÉER UNE NOUVELLE STARTUP
          </button>
          <button type="button" className="btn-ghost" onClick={onReplay}>
            Rejouer {recap.name} ({recap.pathLabel})
          </button>
          <button type="button" className="btn-link" onClick={onHome}>
            Retour à l’accueil
          </button>
        </div>
      </article>
    </main>
  );
}
