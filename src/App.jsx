import { useCallback, useEffect, useRef, useState } from 'react';
import { newGame, chooseOption, nextMonth, currentEvent, visibleChoices } from './game/engine.js';
import { buildRecap } from './game/endings.js';
import { createStorage } from './game/storage.js';
import { CONFIG } from './game/config.js';
import Timeline from './components/Timeline.jsx';
import Hud from './components/Hud.jsx';
import NewsTicker from './components/NewsTicker.jsx';
import EventCard, { Notices } from './components/EventCard.jsx';
import ResultCard from './components/ResultCard.jsx';
import StartScreen from './components/StartScreen.jsx';
import RunRecap from './components/RunRecap.jsx';

const storage = createStorage();

function actOf(month) {
  if (month <= 6) return 'Acte 1 : survivre';
  if (month <= 12) return 'Acte 2 : trouver de la traction';
  return 'Acte 3 : accélérer';
}

function Game({ state, onChoose, onNext }) {
  const event = currentEvent(state);
  const choices = state.phase === 'event' ? visibleChoices(state, event) : [];
  const top = useRef(null);

  // Nouveau mois ou résultat : on remonte vers la carte si elle est sortie de l'écran (mobile).
  useEffect(() => {
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' });
    if (state.phase === 'event') document.getElementById('event-title')?.focus({ preventScroll: true });
  }, [state.month, state.phase]);

  // Raccourcis clavier : 1, 2, 3 pour choisir.
  useEffect(() => {
    if (state.phase !== 'event') return undefined;
    const onKey = (e) => {
      const i = Number(e.key) - 1;
      if (i >= 0 && i < choices.length && !e.metaKey && !e.ctrlKey) onChoose(i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.phase, choices.length, onChoose]);

  return (
    <div className="game">
      <header className="game-head">
        <p className="brand">
          Glane <span>incubée chez EDHEC Entrepreneurs</span>
        </p>
        <p className="game-month">
          <strong>
            Mois {state.month} / {CONFIG.months}
          </strong>
          <span>{actOf(state.month)}</span>
        </p>
      </header>
      <Timeline state={state} />
      <Hud state={state} />
      <NewsTicker state={state} />
      <div className="stage" ref={top}>
        {state.phase === 'event' && (
          <>
            <Notices notices={state.notices} />
            <EventCard key={`${state.month}-${event.id}`} event={event} choices={choices} onChoose={onChoose} />
          </>
        )}
        {state.phase === 'result' && <ResultCard key={`r-${state.month}`} state={state} onNext={onNext} />}
      </div>
    </div>
  );
}

export default function App() {
  const [records, setRecords] = useState(() => storage.loadRecords());
  const [saved, setSaved] = useState(() => storage.loadCurrent());
  const [state, setState] = useState(null);
  const [recap, setRecap] = useState(null);

  useEffect(() => {
    if (state && state.phase !== 'ended') storage.saveCurrent(state);
  }, [state]);

  const start = () => {
    storage.clearCurrent();
    setSaved(null);
    setRecap(null);
    setState(newGame(Math.floor(Math.random() * 2 ** 31)));
  };

  const resume = () => {
    setState(saved);
    setSaved(null);
  };

  const choose = useCallback((i) => setState((s) => chooseOption(s, i)), []);

  const next = () => {
    const n = nextMonth(state);
    if (n.phase === 'ended' && state.phase !== 'ended') {
      const r = buildRecap(n, records);
      const summary = {
        runNumber: r.runNumber,
        type: r.type,
        positive: r.positive,
        monthsSurvived: r.monthsSurvived,
        stats: r.stats,
        profile: { id: r.profile.id, name: r.profile.name },
      };
      setRecords(storage.saveRun(summary, records));
      storage.clearCurrent();
      setRecap(r);
    }
    setState(n);
  };

  const home = () => {
    setRecap(null);
    setState(null);
  };

  if (recap) return <RunRecap recap={recap} records={records} onRestart={start} onHome={home} />;
  if (state) return <Game state={state} onChoose={choose} onNext={next} />;
  return <StartScreen records={records} saved={saved} onStart={start} onResume={resume} />;
}
