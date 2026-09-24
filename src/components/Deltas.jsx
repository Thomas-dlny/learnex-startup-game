import { signedEur, signed } from '../game/format.js';

const LABELS = {
  cash: ['Cash', true],
  mrr: ['MRR', true],
  costs: ['Charges/mois', true],
  clients: ['Clients', false],
  team: ['Équipe', false],
  pmf: ['PMF', false],
};

// Pour les charges, une hausse est une mauvaise nouvelle.
const isGood = (key, v) => (key === 'costs' ? v < 0 : v > 0);

export default function Deltas({ delta }) {
  const entries = Object.entries(delta || {}).filter(([k, v]) => LABELS[k] && v);
  if (entries.length === 0) return null;
  return (
    <ul className="deltas">
      {entries.map(([k, v]) => (
        <li key={k} className={isGood(k, v) ? 'good' : 'bad'}>
          <span>{LABELS[k][0]}</span> {LABELS[k][1] ? signedEur(v) : signed(v)}
        </li>
      ))}
    </ul>
  );
}
