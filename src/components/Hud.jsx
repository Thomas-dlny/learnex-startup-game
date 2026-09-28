import { eur, signedEur, signed, runwayLabel, zeroCashMonth } from '../game/format.js';
import { netBurn, runway, breakEven } from '../game/engine.js';
import StartupTerm from './StartupTerm.jsx';

function Segments({ value, tone }) {
  const filled = Math.round(value / 10);
  return (
    <span className={`segments segments-${tone}${value <= 30 ? ' is-low' : ''}`} aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className={i < filled ? 'on' : ''} />
      ))}
    </span>
  );
}

function Delta({ value, money }) {
  if (!value) return null;
  // Total du mois : effet du choix + bilan de fin de mois.
  return (
    <span className={`hud-delta ${value > 0 ? 'up' : 'down'}`}>
      {money ? signedEur(value) : signed(value)} <small>ce mois</small>
    </span>
  );
}

// Panneau de bord : 5 indicateurs principaux, puis 4 indicateurs secondaires plus compacts.
export default function Hud({ state }) {
  const r = runway(state);
  const burn = netBurn(state);
  const firstOpen = state.phase === 'event' ? state.month : state.month + 1;
  const zero = zeroCashMonth(state, firstOpen);
  const threshold = breakEven(state);
  const progress = Math.min(1, state.mrr / threshold);

  // En phase résultat, on montre ce qui a bougé ce mois-ci.
  const d = {};
  if (state.phase !== 'event' && state.result) {
    for (const src of [state.result.delta, state.result.report?.delta || {}]) {
      for (const [k, v] of Object.entries(src)) d[k] = (d[k] || 0) + v;
    }
  }

  // Revenus au-dessus des charges : le cash monte, on le dit.
  const surplus = state.mrr - state.costs;
  let zeroLine = null;
  if (zero !== null && zero <= 18) {
    zeroLine = zero <= firstOpen ? '0 € ce mois-ci' : `0 € au mois ${zero}`;
  }

  const cells = [
    {
      key: 'cash',
      label: <StartupTerm term="Cash" />,
      value: eur(state.cash),
      delta: <Delta value={d.cash} money />,
      danger: state.cash < 3000,
    },
    {
      key: 'runway',
      label: <StartupTerm term="Runway" />,
      value: surplus > 0 ? 'Cash en hausse' : runwayLabel(r),
      extra: surplus > 0 ? (
        <span className="hud-surplus">{signedEur(surplus)}/mois</span>
      ) : (
        zeroLine && <span className={`hud-zero${r < 4 ? ' is-danger' : ''}`}>{zeroLine}</span>
      ),
      danger: r < 3,
      good: r === Infinity,
    },
    {
      key: 'mrr',
      label: <StartupTerm term="MRR" />,
      value: (
        <>
          {eur(state.mrr)}
          <small>/mois</small>
        </>
      ),
      delta: <Delta value={d.mrr} money />,
    },
    {
      key: 'team',
      label: 'Équipe',
      value: (
        <>
          {state.team}
          <small>/100</small>
        </>
      ),
      gauge: <Segments value={state.team} tone="team" />,
      delta: <Delta value={d.team} />,
      danger: state.team <= 30,
    },
    {
      key: 'pmf',
      label: <StartupTerm term="PMF" />,
      value: (
        <>
          {state.pmf}
          <small>/100</small>
        </>
      ),
      gauge: <Segments value={state.pmf} tone="pmf" />,
      delta: <Delta value={d.pmf} />,
    },
  ];

  return (
    <section className="hud" aria-label="Indicateurs de ta startup">
      <dl className="hud-main">
        {cells.map((c) => (
          <div key={c.key} data-tuto={c.key} className={`hud-cell hud-${c.key}${c.danger ? ' is-danger' : ''}${c.good ? ' is-good' : ''}`}>
            <dt>{c.label}</dt>
            <dd>
              <span className="hud-value">{c.value}</span>
              {c.extra}
              {c.gauge}
              {c.delta}
            </dd>
          </div>
        ))}
      </dl>
      <dl className="hud-sub">
        <div data-tuto="clients">
          <dt>Clients</dt>
          <dd>
            {state.clients}
            <Delta value={d.clients} />
          </dd>
        </div>
        <div>
          <dt>
            <StartupTerm term="Charges" />
          </dt>
          <dd>
            {eur(state.costs)}
            <small>/mois</small>
          </dd>
        </div>
        <div data-tuto="burn" className={burn > 0 ? 'is-burning' : 'is-clear'}>
          <dt>
            <StartupTerm term="Burn">Burn net</StartupTerm>
          </dt>
          <dd>
            {burn === 0 ? 'Aucun' : eur(burn)}
            {burn > 0 && <small>/mois</small>}
          </dd>
        </div>
        <div className={progress >= 1 ? 'is-reached' : ''}>
          <dt>
            <StartupTerm term="Seuil de rentabilité" />
          </dt>
          <dd>
            {eur(threshold)}
            <small> de MRR</small>
          </dd>
          <span className="hud-progress" aria-hidden="true">
            <span style={{ width: `${Math.round(progress * 100)}%` }} />
          </span>
        </div>
      </dl>
    </section>
  );
}
