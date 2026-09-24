import { useEffect, useRef } from 'react';
import Deltas from './Deltas.jsx';
import { eur, signedEur, signed, fr } from '../game/format.js';

function Line({ label, value, tone, total }) {
  return (
    <div className={`ledger-line${total ? ' is-total' : ''}`}>
      <dt>{label}</dt>
      <dd className={tone}>{value}</dd>
    </div>
  );
}

const ENDING_LINES = {
  cash: 'Ton compte est passé sous zéro. La startup ne peut plus payer ses charges.',
  team: 'Ton équipe est à bout. Plus personne ne peut porter la boîte.',
  final: 'Fin des 18 mois d’incubation.',
  exit: 'Tu signes la vente de ta startup.',
};

// Ce qui s'est passé après le choix + relevé du mois.
export default function ResultCard({ state, onNext }) {
  const { result, month, ending } = state;
  const report = result.report;
  const button = useRef(null);
  useEffect(() => button.current?.focus({ preventScroll: true }), []);

  return (
    <article className="card card-result" aria-live="polite">
      <p className="result-choice">
        Ton choix <strong>{fr(result.choiceLabel)}</strong>
      </p>
      {result.text && <p className="result-text">{fr(result.text)}</p>}
      <Deltas delta={result.delta} />

      {report && (
        <section className="ledger" aria-label={`Bilan du mois ${month}`}>
          <h2>Bilan du mois {month}</h2>
          <dl>
            <Line label="Revenus encaissés (MRR)" value={signedEur(report.revenue)} tone={report.revenue > 0 ? 'good' : ''} />
            <Line label="Charges payées" value={signedEur(-report.costs)} tone="bad" />
            <Line label="Nouveaux clients" value={signed(report.newClients)} tone={report.newClients > 0 ? 'good' : ''} />
            {report.lostClients > 0 && <Line label="Clients partis (churn)" value={`-${report.lostClients}`} tone="bad" />}
            {report.delta.pmf > 0 && <Line label="PMF grâce à tes devs" value={signed(report.delta.pmf)} tone="good" />}
            <Line label="Énergie de l’équipe" value={signed(report.teamDelta)} tone={report.teamDelta >= 0 ? 'good' : 'bad'} />
            <Line total label="Cash en fin de mois" value={eur(state.cash)} tone={state.cash < 0 ? 'bad' : ''} />
          </dl>
        </section>
      )}

      {ending && <p className={`result-ending ending-${ending.type}`}>{ENDING_LINES[ending.type]}</p>}

      <button ref={button} type="button" className="btn-primary" onClick={onNext}>
        {ending ? 'Voir le bilan de ta run' : `Passer au mois ${month + 1}`}
      </button>
    </article>
  );
}
