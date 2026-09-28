// Sauvegarde locale (localStorage) : records des runs, partie en cours, préférences.
// Tout est protégé : si le navigateur bloque le stockage, le jeu continue sans sauvegarde.

export const SAVE_VERSION = 2;
const RECORDS_KEY = 'sig.records.v1';
const CURRENT_KEY = 'sig.current.v1';
const TUTO_KEY = 'sig.tuto.v1';
const MAX_RUNS = 20;

const emptyRecords = () => ({
  runs: [],
  totalRuns: 0,
  bestMonths: null,
  bestMrr: null,
  endings: [],
  milestones: [],
  pathsPlayed: [],
  lastPath: null,
  lastName: null,
});

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function createStorage(storage = defaultStorage()) {
  const read = (key) => {
    try {
      const raw = storage?.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const write = (key, value) => {
    try {
      storage?.setItem(key, JSON.stringify(value));
    } catch {
      // stockage plein ou bloqué : on joue sans sauvegarde
    }
  };

  function loadRecords() {
    const r = read(RECORDS_KEY);
    return r && Array.isArray(r.runs) ? { ...emptyRecords(), ...r } : emptyRecords();
  }

  // `base` : records déjà en mémoire. Si le stockage est bloqué, l'historique survit quand même.
  function saveRun(summary, base = loadRecords()) {
    const r = { ...emptyRecords(), ...structuredClone(base) };
    r.runs = [...r.runs, { ...summary, date: new Date().toISOString() }].slice(-MAX_RUNS);
    r.totalRuns += 1;
    r.bestMonths = Math.max(r.bestMonths ?? 0, summary.monthsSurvived);
    r.bestMrr = Math.max(r.bestMrr ?? 0, summary.stats?.mrr ?? 0);
    if (!r.endings.includes(summary.type)) r.endings = [...r.endings, summary.type];
    for (const id of summary.milestones || []) if (!r.milestones.includes(id)) r.milestones = [...r.milestones, id];
    if (summary.path && !r.pathsPlayed.includes(summary.path)) r.pathsPlayed = [...r.pathsPlayed, summary.path];
    if (summary.path) r.lastPath = summary.path;
    if (summary.name) r.lastName = summary.name;
    write(RECORDS_KEY, r);
    return r;
  }

  function saveCurrent(state) {
    write(CURRENT_KEY, state);
  }

  function loadCurrent() {
    const s = read(CURRENT_KEY);
    return s && s.version === SAVE_VERSION && s.phase !== 'ended' ? s : null;
  }

  function clearCurrent() {
    try {
      storage?.removeItem(CURRENT_KEY);
    } catch {
      // rien à faire
    }
  }

  function tutorialDone() {
    return read(TUTO_KEY) === true;
  }

  function setTutorialDone() {
    write(TUTO_KEY, true);
  }

  return { loadRecords, saveRun, saveCurrent, loadCurrent, clearCurrent, tutorialDone, setTutorialDone };
}
