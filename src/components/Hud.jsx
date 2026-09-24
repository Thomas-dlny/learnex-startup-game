import { eur, signedEur, signed, runwayLabel } from '../game/format.js';
import { netBurn, runway, breakEven } from '../game/engine.js';

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
  return <span className={`hud-delta ${value > 0 ? 'up' : 'down'}`}>{money ? signedEur(value) : signed(value)}</span>;
}

// Panneau de bord : les 5 indicateurs principaux + une ligne secondaire.
export default function Hud({ state }) {
  const r = runway(state);
  const showHelp = state.month === 1 && state.phase === 'event';
  // En phase résultat, on montre ce qui a bougé ce mois-ci.
  const d = {};
  if (state.phase !== 'event' && state.result) {
    for (const src of [state.result.delta, state.result.report?.delta || {}]) {
      for (const [k, v] of Object.entries(src)) d[k] = (d[k] || 0) + v;
    }
  }

  const cells = [
    {
      key: 'cash',
      label: 'Cash',
      help: 'L’argent sur ton compte. Sous 0 €, c’est fini.',
      value: eur(state.cash),
      delta: <Delta value={d.cash} money />,
      danger: state.cash < 3000,
    },
    {
      key: 'runway',
      label: 'Runway',
      help: 'Mois restants avant 0 €, si rien ne change.',
      value: runwayLabel(r),
      danger: r < 3,
      good: r === Infinity,
    },
    {
      key: 'mrr',
      label: 'MRR',
      help: 'Revenus qui tombent chaque mois (abonnements).',
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
      help: 'Moral et énergie. À 0, l’équipe lâche.',
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
      label: 'PMF',
      help: 'Product-Market Fit : à quel point ton marché veut ton produit.',
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
          <div key={c.key} className={`hud-cell hud-${c.key}${c.danger ? ' is-danger' : ''}${c.good ? ' is-good' : ''}`} title={c.help}>
            <dt>{c.label}</dt>
            <dd>
              <span className="hud-value">{c.value}</span>
              {c.gauge}
              {c.delta}
              {showHelp && <span className="hud-help">{c.help}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="hud-sub">
        <span>
          Clients <strong>{state.clients}</strong>
          {d.clients ? <Delta value={d.clients} /> : null}
        </span>
        <span>
          Charges <strong>{eur(state.costs)}/mois</strong>
        </span>
        <span>
          Burn net <strong>{netBurn(state) === 0 ? 'aucun' : `${eur(netBurn(state))}/mois`}</strong>
        </span>
        <span title="MRR à atteindre pour payer tes charges et un salaire aux deux fondateurs.">
          Seuil de rentabilité{' '}
          <strong className={state.mrr >= breakEven(state) ? 'is-reached' : ''}>{eur(breakEven(state))} de MRR</strong>
          {!state.flags.foundersPaid && <em> salaires fondateurs compris</em>}
        </span>
      </p>
    </section>
  );
}
