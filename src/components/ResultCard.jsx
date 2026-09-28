import { useEffect, useRef } from 'react';
import Deltas from './Deltas.jsx';
import { Celebrations } from './EventCard.jsx';
import { Rich } from './StartupTerm.jsx';
import { eur, signedEur, signed, fr } from '../game/format.js';
import { CONFIG } from '../game/config.js';

function Line({ label, value, tone, total }) {
  return (
    <div className={`ledger-line${total ? ' is-total' : ''}`}>
      <dt>{label}</dt>
      <dd className={tone}>{value}</dd>
    </div>
  );
}

// Explique pourquoi l'énergie de l'équipe bouge en fin de mois.
function teamLabel(report) {
  if (report.load === undefined) return 'Énergie de l’équipe';
  const charge = `${report.clients} clients pour ${report.capacity} de capacité`;
  if (report.load > CONFIG.heavyOverloadRatio) return `Énergie de l’équipe (forte surcharge : ${charge})`;
  if (report.load > 1) return `Énergie de l’équipe (surcharge : ${charge})`;
  if (report.onboarding > 0) return 'Énergie de l’équipe (intégration des recrues)';
  if (report.load < CONFIG.calmLoad) return 'Énergie de l’équipe (charge légère, elle récupère)';
  return 'Énergie de l’équipe';
}

const tone = (v) => (v > 0 ? 'good' : v < 0 ? 'bad' : '');

// Bilan du mois, en trois blocs. Chaque bloc part de l'effet du choix, ajoute la fin de mois
// et finit sur le total affiché dans le HUD (« ce mois »).
function Ledger({ state, report, choice, month }) {
  const choiceClients = choice.clients || 0;
  const clientsTotal = choiceClients + report.newClients - report.lostClients;
  const choiceTeam = choice.team || 0;
  const cashTotal = (choice.cash || 0) + (report.delta.cash || 0);
  return (
    <section className="ledger" aria-label={`Bilan du mois ${month}`}>
      <h2>Bilan du mois {month}</h2>

      <h3>Cash</h3>
      <dl>
        {choice.cash ? <Line label="Ton choix" value={signedEur(choice.cash)} tone={tone(choice.cash)} /> : null}
        <Line label="Revenus encaissés (MRR)" value={signedEur(report.revenue)} tone={report.revenue > 0 ? 'good' : ''} />
        {report.setupFees > 0 && <Line label="Frais d’installation" value={signedEur(report.setupFees)} tone="good" />}
        <Line label="Charges payées" value={signedEur(-report.costs)} tone="bad" />
        <Line total label={
            <>
              Cash en fin de mois <span className="nowrap">({signedEur(cashTotal)})</span>
            </>
          } value={eur(state.cash)} tone={state.cash < 0 ? 'bad' : ''} />
      </dl>

      <h3>Clients</h3>
      <dl>
        {choiceClients ? <Line label="Ton choix" value={signed(choiceClients)} tone={tone(choiceClients)} /> : null}
        <Line label="Venus seuls (bouche-à-oreille, commerciaux)" value={signed(report.newClients)} tone={tone(report.newClients)} />
        {report.lostClients > 0 && <Line label="Partis (churn)" value={`-${report.lostClients}`} tone="bad" />}
        <Line total label={`Total ce mois : ${state.clients} client${state.clients > 1 ? 's' : ''}`} value={signed(clientsTotal)} tone={tone(clientsTotal)} />
      </dl>

      <h3>Équipe</h3>
      <dl>
        {choiceTeam ? <Line label="Ton choix" value={signed(choiceTeam)} tone={tone(choiceTeam)} /> : null}
        <Line label={teamLabel(report).replace('Énergie de l’équipe', 'Fin de mois')} value={signed(report.teamDelta)} tone={tone(report.teamDelta)} />
        {report.delta.pmf > 0 && <Line label="PMF grâce à tes devs" value={signed(report.delta.pmf)} tone="good" />}
        <Line total label={`Total ce mois : ${state.team}/100`} value={signed(choiceTeam + report.teamDelta)} tone={tone(choiceTeam + report.teamDelta)} />
      </dl>
    </section>
  );
}

const ENDING_LINES = {
  cash: 'Ton compte est passé sous zéro. La startup ne peut plus payer ses charges.',
  team: 'Ton équipe est à bout. Plus personne ne peut porter la boîte.',
  final: 'Fin des 18 mois d’incubation.',
  exit: 'Tu signes la vente de ta startup.',
};

// Ce qui s'est passé après le choix, les jalons atteints, puis le relevé du mois.
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
      {Object.keys(result.delta || {}).length > 0 && <p className="deltas-label">Effet de ton choix</p>}
      <Deltas delta={result.delta} />
      {result.text && (
        <p className="result-text">
          <Rich text={result.text} seen={new Set()} />
        </p>
      )}

      {result.lesson && (
        <aside className="lesson">
          <p className="lesson-kicker">
            <span aria-hidden="true">💡</span> À retenir
          </p>
          <p>{fr(result.lesson)}</p>
        </aside>
      )}

      <Celebrations ids={result.milestones} />

      {report && <Ledger state={state} report={report} choice={result.delta || {}} month={month} />}

      {ending && <p className={`result-ending ending-${ending.type}`}>{ENDING_LINES[ending.type]}</p>}

      <button ref={button} type="button" className="btn-primary" onClick={onNext}>
        {ending ? 'Voir le bilan de ta run' : `Passer au mois ${month + 1}`}
      </button>
    </article>
  );
}
