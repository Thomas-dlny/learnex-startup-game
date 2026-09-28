import { useState } from 'react';
import { ENDINGS } from '../game/endings.js';
import { PATHS, PATH_ORDER, unlockedPaths } from '../data/paths.js';
import { MILESTONES } from '../data/milestones.js';
import StartupTerm from './StartupTerm.jsx';

function runsLabel(n) {
  return n <= 1 ? 'Termine 1 run pour débloquer' : `Termine ${n} runs pour débloquer`;
}

function PathCard({ path, selected, locked, isNew, recommended, onSelect }) {
  return (
    <button
      type="button"
      className={`path-card${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}`}
      aria-pressed={selected}
      disabled={locked}
      onClick={onSelect}
    >
      <span className="path-top">
        <span className="path-kicker">{path.kicker}</span>
        {isNew && <span className="path-badge is-new">🔓 Nouveau parcours</span>}
        {recommended && !isNew && <span className="path-badge">Conseillé pour débuter</span>}
        {locked && <span className="path-badge is-locked">🔒 {runsLabel(path.unlockAfter)}</span>}
      </span>
      <span className="path-name">{path.label}</span>
      <span className="path-pitch">{path.pitch}</span>
      <span className="path-traits">
        {path.traits.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </span>
    </button>
  );
}

function Milestones({ reached }) {
  const got = new Set(reached);
  return (
    <details className="start-milestones">
      <summary>
        Tes jalons <strong>{got.size}/{MILESTONES.length}</strong>
      </summary>
      <ul>
        {MILESTONES.map((m) => (
          <li key={m.id} className={got.has(m.id) ? 'is-done' : ''}>
            <span aria-hidden="true">{got.has(m.id) ? '✓' : '□'}</span>
            {m.label}
            <span className="visually-hidden">{got.has(m.id) ? ' : atteint' : ' : pas encore'}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function StartScreen({ records, saved, onStart, onResume }) {
  const open = unlockedPaths(records.totalRuns);
  const [pathId, setPathId] = useState(() => (open.includes(records.lastPath) ? records.lastPath : 'saas'));
  const path = PATHS[pathId];
  const [names, setNames] = useState(() => ({ [records.lastPath || 'saas']: records.lastName || '' }));
  const name = names[pathId] ?? '';
  const unlocked = records.endings.filter((e) => ENDINGS[e]?.positive).length;
  const positiveTotal = Object.values(ENDINGS).filter((e) => e.positive).length;
  const firstTime = records.totalRuns === 0;

  const submit = (e) => {
    e.preventDefault();
    onStart({ path: pathId, name: name.trim() || path.defaultName });
  };

  return (
    <main className="start">
      <form className="start-panel" onSubmit={submit}>
        <p className="start-kicker">EDHEC Entrepreneurs</p>
        <h1 className="start-title">The Runway Game</h1>
        <p className="start-lede">
          Tu entres en incubation chez EDHEC Entrepreneurs. 18 mois pour transformer un{' '}
          <StartupTerm term="MVP" /> en entreprise qui tient debout. Deux fondateurs, peu de cash, beaucoup de décisions.
        </p>

        <dl className="start-rules">
          <div>
            <dt>Ton objectif</dt>
            <dd>Devenir rentable, lever avec de la traction, ou te faire racheter. Survivre ne suffit pas.</dd>
          </div>
          <div>
            <dt>Chaque mois</dt>
            <dd>Une situation, 2 ou 3 choix. Certaines conséquences arrivent des mois plus tard.</dd>
          </div>
          <div>
            <dt>Autour de toi</dt>
            <dd>Thomas et Robin, tes mentors, t’ouvrent des portes. Gaspard, investisseur, garde un œil sur toi.</dd>
          </div>
          <div>
            <dt>Tu vas perdre</dt>
            <dd>C’est prévu. Lis ton bilan, change de stratégie, relance. Une partie dure 5 à 10 minutes.</dd>
          </div>
        </dl>

        <fieldset className="start-paths">
          <legend>Choisis ton parcours</legend>
          <div className="path-grid">
            {PATH_ORDER.map((id) => (
              <PathCard
                key={id}
                path={PATHS[id]}
                selected={id === pathId}
                locked={!open.includes(id)}
                isNew={open.includes(id) && id !== 'saas' && !records.pathsPlayed.includes(id)}
                recommended={id === 'saas' && firstTime}
                onSelect={() => setPathId(id)}
              />
            ))}
          </div>
        </fieldset>

        <div className="start-name">
          <label htmlFor="startup-name">Le nom de ta startup</label>
          <input
            id="startup-name"
            type="text"
            maxLength={24}
            autoComplete="off"
            placeholder={path.defaultName}
            value={name}
            onChange={(e) => setNames({ ...names, [pathId]: e.target.value })}
          />
          <p className="start-name-hint">Ton produit : un {path.product}.</p>
        </div>

        <div className="start-actions">
          <button type="submit" className="btn-primary btn-xl">
            Lancer {name.trim() || path.defaultName}
          </button>
          {saved && (
            <button type="button" className="btn-ghost" onClick={onResume}>
              Reprendre {saved.name} au mois {saved.month}
            </button>
          )}
        </div>

        {records.totalRuns > 0 && (
          <>
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
            <Milestones reached={records.milestones} />
          </>
        )}
      </form>
    </main>
  );
}
