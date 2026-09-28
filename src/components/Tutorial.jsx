import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { eur } from '../game/format.js';
import { netBurn } from '../game/engine.js';

// Les étapes du tuto : chaque bulle éclaire une case du HUD (attribut data-tuto).
function steps(state) {
  const burn = netBurn(state);
  return [
    {
      target: 'cash',
      title: 'Cash',
      text: `L’argent sur le compte de ${state.name}. S’il passe sous 0 €, la startup ferme.`,
    },
    {
      target: 'burn',
      title: 'Burn net',
      text: `Ce que tu perds chaque mois : tes charges moins tes revenus. Aujourd’hui, ${eur(burn)} partent chaque mois.`,
    },
    {
      target: 'runway',
      title: 'Runway',
      text: 'Le nombre de mois que tu tiens à ce rythme : ton cash divisé par ton burn. Juste en dessous, le mois où tu tombes à 0 €.',
    },
    {
      target: 'mrr',
      title: 'MRR',
      text: 'Tes revenus d’abonnement, chaque mois. Quand ils dépassent tes charges, ton cash arrête de baisser.',
    },
    {
      target: 'team',
      title: 'Équipe',
      text: 'L’énergie de ton équipe. Les rushs la font baisser, les pauses la remontent. À 0, tout s’arrête.',
    },
    {
      target: 'pmf',
      title: 'PMF',
      text: 'À quel point ton marché veut ton produit. Plus il est haut, plus les clients viennent seuls et restent.',
    },
  ];
}

const PAD = 8;

export default function Tutorial({ state, onClose }) {
  const all = steps(state);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);
  const next = useRef(null);
  const step = all[i];

  const measure = useCallback(() => {
    const el = document.querySelector(`[data-tuto="${step.target}"]`);
    if (!el) return setRect(null);
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
  }, [step.target]);

  useLayoutEffect(() => {
    const el = document.querySelector(`[data-tuto="${step.target}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'instant' });
    measure();
  }, [measure, step.target]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  useEffect(() => {
    next.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, onClose]);

  const last = i === all.length - 1;
  const advance = () => (last ? onClose() : setI(i + 1));

  // La bulle se place sous la case éclairée, ou au-dessus s'il manque de place.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  const bubbleWidth = Math.min(340, vw - 32);
  let bubble = { top: vh / 2 - 90, left: (vw - bubbleWidth) / 2 };
  if (rect) {
    const below = rect.top + rect.height + 14;
    const top = below + 200 < vh ? below : Math.max(16, rect.top - 214);
    const left = Math.min(Math.max(16, rect.left + rect.width / 2 - bubbleWidth / 2), vw - bubbleWidth - 16);
    bubble = { top, left };
  }

  return (
    <div className="tuto" role="dialog" aria-modal="true" aria-labelledby="tuto-title" aria-describedby="tuto-text">
      {rect ? (
        <div className="tuto-spot" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />
      ) : (
        <div className="tuto-dim" />
      )}
      <div className="tuto-bubble" style={{ top: bubble.top, left: bubble.left, width: bubbleWidth }} key={i}>
        <p className="tuto-step">
          {i + 1} / {all.length}
        </p>
        <h2 id="tuto-title">{step.title}</h2>
        <p id="tuto-text">{step.text}</p>
        <div className="tuto-actions">
          <button type="button" className="btn-link" onClick={onClose}>
            Passer le tuto
          </button>
          <button type="button" ref={next} className="btn-primary" onClick={advance}>
            {last ? 'C’est parti' : 'Compris'}
          </button>
        </div>
      </div>
    </div>
  );
}
