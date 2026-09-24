import { useEffect, useRef } from 'react';
import { CONFIG } from '../game/config.js';
import { zeroCashMonth } from '../game/format.js';

const ACTS = [
  { label: 'Acte 1 : survivre', from: 1, to: 6 },
  { label: 'Acte 2 : trouver de la traction', from: 7, to: 12 },
  { label: 'Acte 3 : accélérer', from: 13, to: 18 },
];

function Lock() {
  return (
    <svg className="tl-lock" viewBox="0 0 10 12" aria-hidden="true">
      <rect x="1" y="5" width="8" height="6.5" rx="1" />
      <path d="M3 5V3.5a2 2 0 0 1 4 0V5" fill="none" strokeWidth="1.3" />
    </svg>
  );
}

// Frise des 18 mois. La bande dorée sous les mois = mois payés par ton cash actuel (runway).
export default function Timeline({ state }) {
  const firstOpen = state.phase === 'event' ? state.month : state.month + 1;
  const zero = zeroCashMonth(state, firstOpen);
  const months = Array.from({ length: CONFIG.months }, (_, i) => i + 1);
  const track = useRef(null);

  // Sur petit écran, la frise défile : on garde le mois en cours visible.
  useEffect(() => {
    const el = track.current;
    const cur = el?.children[state.month - 1];
    if (el && cur && el.scrollWidth > el.clientWidth) {
      el.scrollLeft = cur.offsetLeft - el.clientWidth / 2 + cur.clientWidth / 2;
    }
  }, [state.month]);

  let caption;
  if (zero === null) caption = 'Tes revenus couvrent tes charges : ton cash ne baisse plus.';
  else if (zero > CONFIG.months) caption = 'À ce rythme, ton cash tient jusqu’à la fin de l’incubation.';
  else if (zero === firstOpen) caption = 'À ce rythme, ton cash passe sous 0 € ce mois-ci.';
  else caption = `À ce rythme, ton cash tombe à 0 € au mois ${zero}.`;

  return (
    <nav className="timeline" aria-label="Progression des 18 mois">
      <ol className="tl-track" ref={track}>
        {months.map((m) => {
          const done = m < state.month || (m === state.month && state.phase !== 'event');
          const current = m === state.month && state.phase === 'event';
          const act = ACTS.find((a) => a.from === m);
          const funded = m >= firstOpen && (zero === null || m < zero);
          const status = done ? 'done' : current ? 'current' : 'locked';
          return (
            <li key={m} className={`tl-month tl-${status}`} aria-current={current ? 'step' : undefined}>
              {act && <span className="tl-act">{act.label}</span>}
              <span className="tl-cell">
                <span className="tl-label">M{m}</span>
                {done && <span className="tl-mark" aria-label="terminé">✓</span>}
                {current && <span className="tl-dot" aria-label="mois en cours" />}
                {status === 'locked' && <Lock />}
              </span>
              <span className={`tl-fuel${funded ? ' is-funded' : ''}${zero === m ? ' is-zero' : ''}`}>
                {zero === m && <span className="tl-zero">0 €</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <p className={`tl-caption${zero !== null && zero - firstOpen < 3 ? ' is-danger' : ''}`}>{caption}</p>
    </nav>
  );
}
