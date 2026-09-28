import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { termByName, splitTerms } from '../data/glossary.js';
import { fr } from '../game/format.js';

// Mot de jargon souligné en pointillés. Survol ou focus clavier sur ordinateur, tap sur mobile.
// Usage : <StartupTerm term="MVP" /> ou <StartupTerm term="PMF">Product-Market Fit</StartupTerm>
export default function StartupTerm({ term, children, entry: given }) {
  const entry = given || termByName(term);
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const id = useId();
  const wrap = useRef(null);
  const pop = useRef(null);
  // Sur écran tactile, un tap déclenche survol, focus puis clic : le clic ne doit pas refermer aussitôt.
  const openedAt = useRef(0);

  // Garde l'infobulle dans l'écran (petits écrans).
  useLayoutEffect(() => {
    if (!open || !pop.current) return;
    const r = pop.current.getBoundingClientRect();
    const margin = 12;
    let dx = 0;
    if (r.right > window.innerWidth - margin) dx = window.innerWidth - margin - r.right;
    if (r.left + dx < margin) dx = margin - r.left;
    setShift((s) => s + dx);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return;
      if (e.type === 'pointerdown' && wrap.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (!entry) return children ?? term;
  const show = () => {
    if (!open) openedAt.current = Date.now();
    setShift(0);
    setOpen(true);
  };

  return (
    <span
      className="term-wrap"
      ref={wrap}
      onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
    >
      <button
        type="button"
        className="term"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (!open) show();
          else if (Date.now() - openedAt.current > 400) setOpen(false);
        }}
      >
        {children ?? term}
      </button>
      {open && (
        <span role="tooltip" id={id} ref={pop} className="term-pop" style={{ '--shift': `${shift}px` }}>
          <strong>{entry.term}</strong> {fr(entry.def)}
        </span>
      )}
    </span>
  );
}

// Texte avec les termes de jargon repérés automatiquement (une fois chacun par carte).
export function Rich({ text, seen }) {
  const parts = splitTerms(fr(text), seen);
  return parts.map((p, i) =>
    typeof p === 'string' ? (
      p
    ) : (
      <StartupTerm key={i} term={p.entry.term} entry={p.entry}>
        {p.text}
      </StartupTerm>
    ),
  );
}
