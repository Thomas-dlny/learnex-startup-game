import Deltas from './Deltas.jsx';
import { fr } from '../game/format.js';

const STAGES = { flash: 'FLASH', breaking: 'BREAKING', alert: 'ALERTE' };

// Initiale du personnage : « Léa, coach... » donne L.
const initial = (speaker) => speaker.trim()[0].toUpperCase();

export function Notices({ notices }) {
  if (!notices?.length) return null;
  return (
    <section className="notices" aria-label="Conséquences de tes choix passés">
      <h2 className="notices-title">Pendant ce temps</h2>
      {notices.map((n, i) => (
        <div key={i} className={`notice notice-${n.tone || 'neutral'}`}>
          <p>
            <strong>{n.title}.</strong> {fr(n.text)}
          </p>
          <Deltas delta={n.delta} />
        </div>
      ))}
    </section>
  );
}

// Carte de l'événement du mois, avec 2 ou 3 choix.
export default function EventCard({ event, choices, onChoose }) {
  const stage = STAGES[event.stage];
  return (
    <article className={`card${stage ? ` card-stage stage-${event.stage}` : ''}`} aria-labelledby="event-title">
      {stage && (
        <div className="stage-band" aria-hidden="true">
          <span className="stage-word">{stage}</span>
        </div>
      )}
      <header className="card-head">
        {event.speaker && (
          <span className="monogram" aria-hidden="true">
            {initial(event.speaker)}
          </span>
        )}
        <p className="card-meta">
          <span className="card-category">{event.category}</span>
          {event.speaker && <span className="card-speaker">{event.speaker}</span>}
        </p>
      </header>
      <h1 id="event-title" className="card-title" tabIndex={-1}>
        {stage && <span className="visually-hidden">{stage} : </span>}
        {fr(event.title)}
      </h1>
      <p className="card-text">{fr(event.text)}</p>
      {event.note && (
        <p className="card-note">
          <span className="note-mark" aria-hidden="true">?</span>
          {fr(event.note)}
        </p>
      )}
      <div className={`choices choices-${choices.length}`}>
        {choices.map((ch, i) => (
          <button key={ch.label} type="button" className="choice" onClick={() => onChoose(i)}>
            <span className="choice-key" aria-hidden="true">
              {i + 1}
            </span>
            <span className="choice-label">{fr(ch.label)}</span>
            {ch.hints?.length > 0 && (
              <span className="choice-hints">
                {ch.hints.map((h) => (
                  <span key={h}>{fr(h)}</span>
                ))}
              </span>
            )}
          </button>
        ))}
      </div>
    </article>
  );
}
