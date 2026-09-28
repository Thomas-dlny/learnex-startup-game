// Moteur de jeu. Fonctions pures : elles reçoivent un état et renvoient un nouvel état.
// Le contenu (événements, conséquences, news) vient de src/data et peut être injecté pour les tests.

import { CONFIG } from './config.js';
import { roll, randomRound } from './rng.js';
import { fill } from './format.js';
import { EVENTS } from '../data/events.js';
import { CALLBACKS } from '../data/callbacks.js';
import { NEWS } from '../data/news.js';
import { PATHS, pathOf } from '../data/paths.js';
import { MENTORS, GENERIC_ADVICE, ADVICE_PER_RUN } from '../data/characters.js';
import { MILESTONES } from '../data/milestones.js';
import { SAVE_VERSION } from './storage.js';

export const DEFAULT_CONTENT = { events: EVENTS, callbacks: CALLBACKS, news: NEWS };

const clamp = (x, min, max) => Math.min(max, Math.max(min, x));

// ---------------------------------------------------------------------------
// Lecture de l'état

export function netBurn(s) {
  return Math.max(s.costs - s.mrr, 0);
}

export function runway(s) {
  const burn = netBurn(s);
  return burn === 0 ? Infinity : s.cash / burn;
}

// Seuil de rentabilité : MRR à atteindre pour payer les charges ET les salaires des fondateurs.
export function breakEven(s) {
  return s.costs + (s.flags.foundersPaid ? 0 : CONFIG.founderSalary);
}

export function headcount(s) {
  return CONFIG.founders + s.staff.length;
}

// Une recrue devient efficace après son intégration.
// L'atelier recrutement de l'incubateur raccourcit l'intégration d'un mois.
export function isOnboarded(s, person) {
  const months = CONFIG.onboardingMonths - (s.flags.hiringWorkshop ? 1 : 0);
  return s.month - person.since >= months;
}

function staffCount(s, role, onboardedOnly = false) {
  return s.staff.filter((p) => p.role === role && (!onboardedOnly || isOnboarded(s, p))).length;
}

// Croissance du MRR sur les 3 derniers mois (0,5 = +50 %).
export function mrrGrowth(s) {
  const h = s.mrrHistory || [];
  if (h.length < 2) return 0;
  const old = h[Math.max(0, h.length - 4)];
  return (s.mrr - old) / Math.max(old, 1000);
}

function findEvent(id, content) {
  return content.events.find((e) => e.id === id) || content.callbacks.find((e) => e.id === id);
}

export function currentEvent(s, content = DEFAULT_CONTENT) {
  return s.current ? findEvent(s.current.id, content) : null;
}

// Mentor qui parle ce mois-ci (Thomas et Robin se relaient).
export function mentorOf(s) {
  const id = s.current?.mentor;
  return MENTORS.find((m) => m.id === id) || MENTORS[(s.mentorTurn || 0) % MENTORS.length];
}

export function speakerOf(s, event) {
  if (!event?.speaker) return null;
  if (event.speaker === 'mentor') {
    const m = mentorOf(s);
    return `${m.name}, ${m.role}`;
  }
  return fill(event.speaker, s);
}

// ---------------------------------------------------------------------------
// Conditions et chances (utilisées par les données)

export function meets(s, cond) {
  if (!cond) return true;
  const flags = [].concat(cond.flag || []);
  const notFlags = [].concat(cond.notFlag || []);
  return (
    (cond.minPmf === undefined || s.pmf >= cond.minPmf) &&
    (cond.maxPmf === undefined || s.pmf <= cond.maxPmf) &&
    (cond.minMrr === undefined || s.mrr >= cond.minMrr) &&
    (cond.maxMrr === undefined || s.mrr <= cond.maxMrr) &&
    (cond.minCash === undefined || s.cash >= cond.minCash) &&
    (cond.maxCash === undefined || s.cash <= cond.maxCash) &&
    (cond.minClients === undefined || s.clients >= cond.minClients) &&
    (cond.maxClients === undefined || s.clients <= cond.maxClients) &&
    (cond.minTeam === undefined || s.team >= cond.minTeam) &&
    (cond.maxTeam === undefined || s.team <= cond.maxTeam) &&
    (cond.minStaff === undefined || s.staff.length >= cond.minStaff) &&
    (cond.maxStaff === undefined || s.staff.length <= cond.maxStaff) &&
    (cond.minMonth === undefined || s.month >= cond.minMonth) &&
    (cond.role === undefined || staffCount(s, cond.role) > 0) &&
    (cond.noRole === undefined || staffCount(s, cond.noRole) === 0) &&
    (cond.market === undefined || [].concat(cond.market).includes(s.market)) &&
    (cond.path === undefined || [].concat(cond.path).includes(s.path)) &&
    flags.every((f) => s.flags[f]) &&
    notFlags.every((f) => !s.flags[f])
  );
}

// chance = base + pmf x PMF + team x équipe + mrr x (MRR / 1000) + growth x croissance du MRR
//          + bonus marché + bonus flags
export function chanceOf(s, spec) {
  let p = spec.base || 0;
  p += (spec.pmf || 0) * s.pmf;
  p += (spec.team || 0) * s.team;
  p += (spec.mrr || 0) * Math.min(s.mrr / 1000, 15);
  p += (spec.growth || 0) * clamp(mrrGrowth(s), 0, 2);
  p += (spec.market && spec.market[s.market]) || 0;
  for (const [flag, bonus] of Object.entries(spec.flags || {})) {
    if (s.flags[flag]) p += bonus;
  }
  return clamp(p, 0.05, 0.95);
}

function pickOutcome(s, outcomes) {
  const eligible = outcomes.filter((o) => meets(s, o.if));
  for (const o of eligible) {
    if (!o.chance) return o;
    if (roll(s) < chanceOf(s, o.chance)) return o;
  }
  return eligible[eligible.length - 1] || {};
}

export function visibleChoices(s, event) {
  return (event.choices || []).filter((ch) => meets(s, ch.if));
}

// ---------------------------------------------------------------------------
// Effets

const TRACKED = ['cash', 'mrr', 'clients', 'team', 'pmf', 'costs'];

function snapshot(s) {
  const snap = {};
  for (const k of TRACKED) snap[k] = s[k];
  return snap;
}

function diff(before, after) {
  const d = {};
  for (const k of TRACKED) {
    const v = Math.round(after[k] - before[k]);
    if (v !== 0) d[k] = v;
  }
  return d;
}

function changeClients(s, n) {
  if (n > 0) {
    s.clients += n;
    s.mrr += n * s.arpu;
    s.cash += n * (pathOf(s).setupFee || 0);
  } else if (n < 0 && s.clients > 0) {
    const lost = Math.min(s.clients, -n);
    s.mrr -= Math.round((s.mrr / s.clients) * lost);
    s.clients -= lost;
  }
  if (s.clients === 0) s.mrr = Math.max(s.mrr, 0);
}

// Retire du personnel : `role` = 'dev' | 'sales' | 'intern' (la personne la plus récente) ou 'all'.
function fire(s, role) {
  if (role === 'all') {
    for (const p of s.staff) s.costs -= p.cost;
    s.staff = [];
    return;
  }
  const idx = s.staff.map((p) => p.role).lastIndexOf(role);
  if (idx === -1) return;
  s.costs -= s.staff[idx].cost;
  s.staff.splice(idx, 1);
}

// Applique un objet d'effets à l'état (mutation d'un brouillon).
export function applyEffects(s, fx = {}) {
  if (fx.cash) s.cash += fx.cash;
  if (fx.costs) s.costs += fx.costs;
  if (fx.clients) changeClients(s, fx.clients);
  if (fx.clientsPct) changeClients(s, -Math.round((s.clients * -fx.clientsPct) / 100));
  if (fx.mrr) s.mrr = Math.max(0, s.mrr + fx.mrr);
  if (fx.mrrPct) s.mrr = Math.max(0, Math.round(s.mrr * (1 + fx.mrrPct / 100)));
  if (fx.arpu) s.arpu = Math.max(50, s.arpu + fx.arpu);
  if (fx.arpuPct) s.arpu = Math.max(50, Math.round(s.arpu * (1 + fx.arpuPct / 100)));
  if (fx.costsPct) s.costs = Math.round(s.costs * (1 + fx.costsPct / 100));
  if (fx.team) s.team = clamp(s.team + fx.team, 0, 100);
  if (fx.pmf) s.pmf = clamp(s.pmf + fx.pmf, 0, 100);
  if (fx.equity) s.equity = clamp(s.equity + fx.equity, 0, 100);
  for (const h of [].concat(fx.hire || [])) {
    s.staff.push({ ...h, since: s.month });
    s.costs += h.cost;
    s.stats.hires.push({ month: s.month, role: h.role, mrr: s.mrr, pmf: s.pmf });
  }
  if (fx.fire) fire(s, fx.fire);
  if (fx.flags) Object.assign(s.flags, fx.flags);
  if (fx.market) s.market = fx.market;
  s.costs = Math.max(0, s.costs);
}

function schedule(s, delayed, source) {
  for (const d of delayed || []) {
    s.pending.push({ due: s.month + d.in, id: d.id, source });
  }
}

// Jalons atteints depuis le dernier contrôle.
function checkMilestones(s) {
  const reached = [];
  for (const m of MILESTONES) {
    if (s.milestones.some((x) => x.id === m.id)) continue;
    if (m.test(s)) {
      s.milestones.push({ id: m.id, month: s.month });
      reached.push(m.id);
    }
  }
  return reached;
}

// ---------------------------------------------------------------------------
// Clôture du mois : revenus, charges, croissance, churn, charge de l'équipe

export function expectedGrowth(s) {
  const span = CONFIG.pmfFull - CONFIG.pmfFloor;
  const pmfFactor = Math.max(0, (s.pmf - CONFIG.pmfFloor) / span) ** CONFIG.pmfCurve;
  const sales = staffCount(s, 'sales', true);
  const boost = s.pmf >= CONFIG.salesPmfThreshold ? CONFIG.salesBoostWithPmf : CONFIG.salesBoostWithoutPmf;
  const saturation = 1 / (1 + s.clients / CONFIG.saturationClients);
  // Après une levée, le budget marketing du tour accélère l'acquisition.
  const funded = s.flags.raised ? CONFIG.raisedGrowthBoost : 1;
  return CONFIG.growthBase * pathOf(s).growth * pmfFactor * (1 + sales * boost) * CONFIG.marketGrowth[s.market] * saturation * funded;
}

export function closeMonth(s) {
  const revenue = s.mrr;
  const costs = s.costs;
  s.cash += revenue - costs;

  const pmfFromDevs = staffCount(s, 'dev', true) * CONFIG.devPmfPerMonth;
  s.pmf = clamp(s.pmf + pmfFromDevs, 0, 100);

  // Clients perdus (calculés sur la base de clients du début de mois)
  const churnRate = CONFIG.churn.find((c) => s.pmf < c.below).rate * pathOf(s).churn;
  const lostClients = Math.min(s.clients, randomRound(s, s.clients * churnRate));
  changeClients(s, -lostClients);

  // Nouveaux clients (et frais d'installation éventuels)
  const cashBefore = s.cash;
  const newClients = randomRound(s, expectedGrowth(s));
  changeClients(s, newClients);
  const setupFees = s.cash - cashBefore;

  // Charge de l'équipe, et fatigue des intégrations en cours
  const load = s.clients / (headcount(s) * (pathOf(s).clientsPerPerson || CONFIG.clientsPerPerson));
  let teamDelta = load < CONFIG.calmLoad ? CONFIG.teamRecovery : 0;
  if (load > CONFIG.heavyOverloadRatio) teamDelta = CONFIG.teamHeavyOverload;
  else if (load > 1) teamDelta = CONFIG.teamOverload;
  const onboarding = s.staff.filter((p) => !isOnboarded(s, p)).length;
  teamDelta -= Math.min(onboarding * CONFIG.onboardingTeamCost, 6);
  const teamBefore = s.team;
  s.team = clamp(s.team + teamDelta, 0, 100);
  if (load > 1) s.stats.overloadMonths += 1;

  // Rentabilité : les revenus couvrent les charges ET un salaire pour les fondateurs
  s.profitStreak = s.mrr >= breakEven(s) ? s.profitStreak + 1 : 0;

  s.mrrHistory.push(s.mrr);
  s.stats.minCash = Math.min(s.stats.minCash, s.cash);
  s.stats.peakCosts = Math.max(s.stats.peakCosts, s.costs);
  s.stats.peakMrr = Math.max(s.stats.peakMrr, s.mrr);

  return { revenue, costs, newClients, lostClients, setupFees, onboarding, teamDelta: s.team - teamBefore };
}

// ---------------------------------------------------------------------------
// Sélection des événements

function pickWeighted(s, items, weightOf) {
  const total = items.reduce((sum, it) => sum + weightOf(it), 0);
  let r = roll(s) * total;
  for (const it of items) {
    r -= weightOf(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function weightOf(s, e) {
  const w = e.weight ?? 1;
  const base = typeof w === 'object' ? (w[s.path] ?? w.default ?? 1) : w;
  return base * (e.category === s.lastCategory ? 0.3 : 1);
}

export function inPath(s, e) {
  return !e.paths || e.paths.includes(s.path);
}

function selectEvent(s, content, forcedId) {
  if (forcedId) return { id: forcedId, kind: 'callback' };

  const byUrgency = (type) => content.events.find((e) => e.urgent === type);
  const alert = byUrgency('runway');
  if (alert && runway(s) < CONFIG.runwayAlertMonths && s.counters.runwayAlerts < CONFIG.maxRunwayAlerts) {
    s.counters.runwayAlerts += 1;
    return { id: alert.id, kind: 'urgent' };
  }
  const crisis = byUrgency('team');
  if (crisis && s.team <= CONFIG.teamCrisisAt && !s.flags.teamCrisisDone) {
    s.flags.teamCrisisDone = true;
    return { id: crisis.id, kind: 'urgent' };
  }

  const pool = content.events.filter(
    (e) =>
      !e.urgent &&
      !e.fallback &&
      !e.start &&
      inPath(s, e) &&
      s.month >= e.months[0] &&
      s.month <= e.months[1] &&
      !s.seen.includes(e.id) &&
      meets(s, e.when),
  );
  if (pool.length === 0) {
    const fallback = content.events.find((e) => e.fallback);
    return { id: fallback.id, kind: 'fallback' };
  }
  const picked = pickWeighted(s, pool, (e) => weightOf(s, e));
  return { id: picked.id, kind: 'event' };
}

// Prépare l'événement choisi : mentor du mois, conseil pas encore demandé.
function setCurrent(s, current, content) {
  const ev = findEvent(current.id, content);
  s.current = current;
  if (ev.speaker === 'mentor') {
    s.current.mentor = MENTORS[s.mentorTurn % MENTORS.length].id;
    s.mentorTurn += 1;
  }
  if (current.kind === 'event') s.seen.push(ev.id);
  s.lastCategory = ev.category;
}

function changeMarket(s, content) {
  if (s.month < CONFIG.marketChangeFromMonth || content.news.length === 0) return;
  if (roll(s) >= CONFIG.marketChangeChance) return;
  const options = content.news.filter((n) => n.mood && n.mood !== s.market && n.id !== s.news?.id);
  if (options.length === 0) return;
  const n = options[Math.floor(roll(s) * options.length)];
  s.market = n.mood;
  s.news = { id: n.id, text: n.text, mood: n.mood, fresh: true };
}

// ---------------------------------------------------------------------------
// API publique

export function newGame(seed = Date.now(), content = DEFAULT_CONTENT, options = {}) {
  const path = PATHS[options.path] || PATHS.saas;
  const st = { ...CONFIG.start, ...path.start };
  const name = (options.name || '').trim().slice(0, 24) || path.defaultName;
  const s = {
    version: SAVE_VERSION,
    seed,
    rng: seed >>> 0,
    path: path.id,
    name,
    month: 1,
    phase: 'event',
    cash: st.cash,
    costs: st.costs,
    arpu: st.arpu,
    mrr: 0,
    clients: 0,
    team: st.team,
    pmf: st.pmf,
    equity: st.equity,
    staff: [],
    market: 'normal',
    news: null,
    flags: {},
    counters: { runwayAlerts: 0 },
    seen: [],
    pending: [],
    notices: [],
    celebrate: [],
    milestones: [],
    lessons: [],
    mentorTurn: 0,
    adviceLeft: ADVICE_PER_RUN,
    current: null,
    lastCategory: null,
    result: null,
    ending: null,
    profitStreak: 0,
    mrrHistory: [],
    history: [],
    stats: { hires: [], overloadMonths: 0, minCash: st.cash, peakCosts: st.costs, peakMrr: 0, spent: {} },
  };
  const first = findEvent(path.first, content) || findEvent('interviews', content);
  setCurrent(s, { id: first.id, kind: 'event' }, content);
  return s;
}

// Conseil d'un mentor : une piste de réflexion, jamais la réponse. Deux par run.
export function adviceFor(s, content = DEFAULT_CONTENT) {
  const ev = currentEvent(s, content);
  if (ev?.advice) return fill(ev.advice, s);
  return GENERIC_ADVICE.find((a) => a.test(s, runway(s))).text;
}

export function askAdvice(state, content = DEFAULT_CONTENT) {
  if (state.phase !== 'event' || state.adviceLeft <= 0 || state.current.advice) return state;
  const s = structuredClone(state);
  const mentor = s.current.mentor ? mentorOf(s) : MENTORS[(s.adviceLeft + s.month) % MENTORS.length];
  s.current.advice = { mentor: mentor.id, text: adviceFor(s, content) };
  s.adviceLeft -= 1;
  return s;
}

export function chooseOption(state, index, content = DEFAULT_CONTENT) {
  if (state.phase !== 'event') return state;
  const event = currentEvent(state, content);
  const choice = visibleChoices(state, event)[index];
  if (!choice) return state;

  const s = structuredClone(state);
  const before = snapshot(s);

  applyEffects(s, choice.effects);
  schedule(s, choice.delayed, event.id);
  const outcome = choice.outcomes ? pickOutcome(s, choice.outcomes) : {};
  applyEffects(s, outcome.effects);
  schedule(s, outcome.delayed, event.id);

  const spent = -Math.min(0, (choice.effects?.cash || 0) + (outcome.effects?.cash || 0));
  for (const tag of choice.tags || []) s.stats.spent[tag] = (s.stats.spent[tag] || 0) + spent;

  const choiceDelta = diff(before, s);
  s.history.push({
    month: s.month,
    eventId: event.id,
    title: fill(event.title, s),
    choice: fill(choice.label, s),
    tags: choice.tags || [],
    delta: choiceDelta,
    hire: Boolean(choice.effects?.hire || outcome.effects?.hire),
  });

  // « À retenir » : rare, jamais deux mois de suite.
  let lesson = null;
  const lastLesson = s.lessons[s.lessons.length - 1];
  const lessonText = outcome.lesson || choice.lesson;
  if (lessonText && s.lessons.length < CONFIG.maxLessons && (lastLesson === undefined || s.month - lastLesson > 1)) {
    lesson = fill(lessonText, s);
    s.lessons.push(s.month);
  }

  const text = fill(outcome.text || choice.text || '', s);
  // Jalons atteints par le choix lui-même (avant le churn de fin de mois).
  const reachedByChoice = checkMilestones(s);
  let report = null;
  // Au dernier mois, les 18 mois sont tenus : une équipe à bout ne transforme plus la fin
  // en défaite, elle compte dans le bilan final (rentable et levée exigent une équipe debout).
  const lastMonth = s.month >= CONFIG.months;
  if (outcome.end || choice.end) {
    s.ending = { type: outcome.end || choice.end };
  } else if (s.team <= 0 && !lastMonth) {
    s.ending = { type: 'team' };
  } else {
    const beforeClose = snapshot(s);
    report = closeMonth(s);
    report.delta = diff(beforeClose, s);
    if (s.cash < 0) s.ending = { type: 'cash' };
    else if (lastMonth) s.ending = { type: 'final' };
    else if (s.team <= 0) s.ending = { type: 'team' };
  }

  s.phase = 'result';
  const dead = s.ending && s.ending.type !== 'final' && s.ending.type !== 'exit';
  const milestones = [...reachedByChoice, ...(dead ? [] : checkMilestones(s))];
  s.result = { choiceLabel: fill(choice.label, s), text, delta: choiceDelta, report, lesson, milestones };
  return s;
}

export function nextMonth(state, content = DEFAULT_CONTENT) {
  if (state.phase !== 'result') return state;
  const s = structuredClone(state);

  if (s.ending) {
    s.phase = 'ended';
    return s;
  }

  s.month += 1;
  s.notices = [];
  s.celebrate = [];
  s.result = null;
  if (s.news) s.news.fresh = false;

  // Conséquences différées arrivées à échéance
  let forcedId = null;
  const due = s.pending.filter((p) => p.due <= s.month);
  s.pending = s.pending.filter((p) => p.due > s.month);
  for (const p of due) {
    const cb = content.callbacks.find((c) => c.id === p.id);
    if (!cb) continue;
    if (cb.choices) {
      if (forcedId) s.pending.push({ ...p, due: s.month + 1 });
      else forcedId = cb.id;
      continue;
    }
    const before = snapshot(s);
    const outcome = pickOutcome(s, cb.outcomes || []);
    applyEffects(s, outcome.effects);
    schedule(s, outcome.delayed, cb.id);
    if (outcome.text !== '') {
      s.notices.push({ id: cb.id, title: fill(cb.title, s), text: fill(outcome.text || '', s), delta: diff(before, s), tone: outcome.tone });
    }
    if (outcome.trigger) {
      if (forcedId) s.pending.push({ due: s.month + 1, id: outcome.trigger, source: cb.id });
      else forcedId = outcome.trigger;
    }
  }

  if (s.team <= 0) {
    s.ending = { type: 'team' };
    s.phase = 'ended';
    return s;
  }

  s.phase = 'event';
  s.celebrate = checkMilestones(s);

  changeMarket(s, content);
  setCurrent(s, selectEvent(s, content, forcedId), content);
  return s;
}
