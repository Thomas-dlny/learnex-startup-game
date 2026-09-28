import { useCallback, useEffect, useRef, useState } from 'react';
import { newGame, chooseOption, nextMonth, askAdvice, currentEvent, visibleChoices } from './game/engine.js';
import { buildRecap } from './game/endings.js';
import { createStorage } from './game/storage.js';
import { CONFIG } from './game/config.js';
import { pathOf } from './data/paths.js';
import Timeline from './components/Timeline.jsx';
import Hud from './components/Hud.jsx';
import NewsTicker from './components/NewsTicker.jsx';
import EventCard, { Notices } from './components/EventCard.jsx';
import ResultCard from './components/ResultCard.jsx';
import StartScreen from './components/StartScreen.jsx';
import RunRecap from './components/RunRecap.jsx';
import Tutorial from './components/Tutorial.jsx';

const storage = createStorage();

function actOf(month) {
  if (month <= 6) return 'Acte 1 : survivre';
  if (month <= 12) return 'Acte 2 : trouver de la traction';
  return 'Acte 3 : accélérer';
}

function Game({ state, onChoose, onNext, onAsk, tutorial, onTutorial }) {
  const event = currentEvent(state);
  const choices = state.phase === 'event' ? visibleChoices(state, event) : [];
  const top = useRef(null);

  // Nouveau mois ou résultat : on remonte vers la carte si elle est sortie de l'écran (mobile).
  useEffect(() => {
    if (tutorial) return;
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' });
    if (state.phase === 'event') document.getElementById('event-title')?.focus({ preventScroll: true });
  }, [state.month, state.phase, tutorial]);

  // Raccourcis clavier : 1, 2, 3 pour choisir.
  useEffect(() => {
    if (state.phase !== 'event' || tutorial) return undefined;
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement) return;
      const i = Number(e.key) - 1;
      if (i >= 0 && i < choices.length && !e.metaKey && !e.ctrlKey && !e.altKey) onChoose(i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.phase, choices.length, onChoose, tutorial]);

  return (
    <div className="game" inert={tutorial}>
      <header className="game-head">
        <p className="brand">
          {state.name} <span>{pathOf(state).label} · incubée chez EDHEC Entrepreneurs</span>
        </p>
        <p className="game-month">
          <strong>
            Mois {state.month} / {CONFIG.months}
          </strong>
          <span>{actOf(state.month)}</span>
          <button type="button" className="btn-help" onClick={onTutorial} aria-label="Revoir le tuto des indicateurs" title="Revoir le tuto">
            ?
          </button>
        </p>
      </header>
      <Timeline state={state} />
      <Hud state={state} />
      <NewsTicker state={state} />
      <div className="stage" ref={top}>
        {state.phase === 'event' && (
          <>
            <Notices notices={state.notices} celebrate={state.celebrate} />
            <EventCard key={`${state.month}-${event.id}`} state={state} event={event} choices={choices} onChoose={onChoose} onAsk={onAsk} />
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
  const [tutorial, setTutorial] = useState(false);

  useEffect(() => {
    if (state && state.phase !== 'ended') storage.saveCurrent(state);
  }, [state]);

  const start = (options) => {
    storage.clearCurrent();
    setSaved(null);
    setRecap(null);
    window.scrollTo(0, 0);
    setState(newGame(Math.floor(Math.random() * 2 ** 31), undefined, options));
    if (!storage.tutorialDone()) setTutorial(true);
  };

  const resume = () => {
    setState(saved);
    setSaved(null);
  };

  const choose = useCallback((i) => setState((s) => chooseOption(s, i)), []);
  const ask = useCallback(() => setState((s) => askAdvice(s)), []);

  const closeTutorial = useCallback(() => {
    storage.setTutorialDone();
    setTutorial(false);
  }, []);

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
        path: r.path,
        pathLabel: r.pathLabel,
        name: r.name,
        headline: r.headline,
        milestones: r.milestoneIds,
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

  if (recap) {
    return (
      <RunRecap
        recap={recap}
        records={records}
        onRestart={home}
        onReplay={() => start({ path: recap.path, name: recap.name })}
        onHome={home}
      />
    );
  }
  if (state) {
    return (
      <>
        <Game state={state} onChoose={choose} onNext={next} onAsk={ask} tutorial={tutorial} onTutorial={() => setTutorial(true)} />
        {tutorial && <Tutorial state={state} onClose={closeTutorial} />}
      </>
    );
  }
  return <StartScreen records={records} saved={saved} onStart={start} onResume={resume} />;
}
