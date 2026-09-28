import { useEffect, useRef, useState } from 'react';
import Deltas from './Deltas.jsx';
import { Rich } from './StartupTerm.jsx';
import { fr, fill } from '../game/format.js';
import { speakerOf } from '../game/engine.js';
import { MENTORS } from '../data/characters.js';
import { milestoneById } from '../data/milestones.js';

const STAGES = { flash: 'FLASH', breaking: 'BREAKING', alert: 'ALERTE' };

// Initiale du personnage : « Thomas, mentor... » donne T.
const initial = (speaker) => speaker.trim()[0].toUpperCase();

export function Celebrations({ ids }) {
  if (!ids?.length) return null;
  return (
    <ul className="celebrations" aria-label="Jalons atteints">
      {ids.map((id, i) => {
        const m = milestoneById(id);
        if (!m) return null;
        return (
          <li key={id} className="milestone-pop" style={{ '--i': i }}>
            <span className="milestone-icon" aria-hidden="true">
              {m.icon}
            </span>
            <span>
              <small>Jalon atteint</small>
              {m.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function Notices({ notices, celebrate }) {
  if (!notices?.length && !celebrate?.length) return null;
  return (
    <section className="notices" aria-label="Conséquences de tes choix passés">
      {notices?.length > 0 && <h2 className="notices-title">Pendant ce temps</h2>}
      {notices?.map((n, i) => (
        <div key={i} className={`notice notice-${n.tone || 'neutral'}`}>
          <p>
            <strong>{fr(n.title)}.</strong> {fr(n.text)}
          </p>
          <Deltas delta={n.delta} />
        </div>
      ))}
      <Celebrations ids={celebrate} />
    </section>
  );
}

function Advice({ state, onAsk }) {
  const given = state.current?.advice;
  const [closed, setClosed] = useState(false);
  const panel = useRef(null);
  useEffect(() => {
    if (given) panel.current?.focus({ preventScroll: true });
  }, [given]);

  if (given && closed) return null;
  if (given) {
    const mentor = MENTORS.find((m) => m.id === given.mentor) || MENTORS[0];
    return (
      <aside className="advice" ref={panel} tabIndex={-1} aria-label={`Conseil de ${mentor.name}`}>
        <span className="monogram monogram-sm" aria-hidden="true">
          {mentor.name[0]}
        </span>
        <div>
          <p className="advice-who">
            {mentor.name}, {mentor.role}
          </p>
          <p className="advice-text">« {fr(given.text)} »</p>
          <button
            type="button"
            className="btn-thanks"
            onClick={() => {
              setClosed(true);
              document.querySelector('.choice')?.focus();
            }}
          >
            Merci, je décide
          </button>
        </div>
      </aside>
    );
  }
  if (state.adviceLeft <= 0) return null;
  return (
    <button type="button" className="btn-advice" onClick={onAsk}>
      <span aria-hidden="true">💬</span> Demander conseil à un mentor
      <span className="advice-left">
        {state.adviceLeft} restant{state.adviceLeft > 1 ? 's' : ''}
      </span>
    </button>
  );
}

// Carte de l'événement du mois, avec 2 ou 3 choix.
export default function EventCard({ state, event, choices, onChoose, onAsk }) {
  const stage = STAGES[event.stage];
  const speaker = speakerOf(state, event);
  const seen = new Set();
  return (
    <article className={`card${stage ? ` card-stage stage-${event.stage}` : ''}`} aria-labelledby="event-title">
      {stage && (
        <div className="stage-band" aria-hidden="true">
          <span className="stage-word">{stage}</span>
        </div>
      )}
      <header className="card-head">
        {speaker && (
          <span className={`monogram${event.speaker === 'mentor' ? ' is-mentor' : ''}`} aria-hidden="true">
            {initial(speaker)}
          </span>
        )}
        <p className="card-meta">
          <span className="card-category">{fill(event.category, state)}</span>
          {speaker && <span className="card-speaker">{fr(speaker)}</span>}
        </p>
      </header>
      <h1 id="event-title" className="card-title" tabIndex={-1}>
        {stage && <span className="visually-hidden">{stage} : </span>}
        <Rich text={fill(event.title, state)} seen={seen} />
      </h1>
      <p className="card-text">
        <Rich text={fill(event.text, state)} seen={seen} />
      </p>
      <Advice state={state} onAsk={onAsk} />
      <div className={`choices choices-${choices.length}`}>
        {choices.map((ch, i) => (
          <button key={ch.label} type="button" className="choice" onClick={() => onChoose(i)}>
            <span className="choice-key" aria-hidden="true">
              {i + 1}
            </span>
            <span className="choice-label">{fr(fill(ch.label, state))}</span>
            {ch.hints?.length > 0 && (
              <span className="choice-hints">
                {ch.hints.map((h) => (
                  <span key={h}>{fr(fill(h, state))}</span>
                ))}
              </span>
            )}
          </button>
        ))}
      </div>
    </article>
  );
}
