// Moteur de jeu. Fonctions pures : elles reçoivent un état et renvoient un nouvel état.
// Le contenu (événements, conséquences, news) vient de src/data et peut être injecté pour les tests.

import { CONFIG } from './config.js';
import { roll, randomRound } from './rng.js';
import { EVENTS } from '../data/events.js';
import { CALLBACKS } from '../data/callbacks.js';
import { NEWS } from '../data/news.js';
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

export function headcount(s) {
  return CONFIG.founders + s.staff.length;
}

function staffCount(s, role) {
  return s.staff.filter((p) => p.role === role).length;
}

function findEvent(id, content) {
  return content.events.find((e) => e.id === id) || content.callbacks.find((e) => e.id === id);
}

export function currentEvent(s, content = DEFAULT_CONTENT) {
  return s.current ? findEvent(s.current.id, content) : null;
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
    (cond.role === undefined || staffCount(s, cond.role) > 0) &&
    (cond.noRole === undefined || staffCount(s, cond.noRole) === 0) &&
    (cond.market === undefined || [].concat(cond.market).includes(s.market)) &&
    flags.every((f) => s.flags[f]) &&
    notFlags.every((f) => !s.flags[f])
  );
}

// chance = base + pmf x PMF + team x équipe + mrr x (MRR / 1000) + bonus marché + bonus flags
export function chanceOf(s, spec) {
  let p = spec.base || 0;
  p += (spec.pmf || 0) * s.pmf;
  p += (spec.team || 0) * s.team;
  p += (spec.mrr || 0) * (s.mrr / 1000);
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

// ---------------------------------------------------------------------------
// Clôture du mois : revenus, charges, croissance, churn, charge de l'équipe

export function closeMonth(s) {
  const revenue = s.mrr;
  const costs = s.costs;
  s.cash += revenue - costs;

  const pmfFromDevs = staffCount(s, 'dev') * CONFIG.devPmfPerMonth;
  s.pmf = clamp(s.pmf + pmfFromDevs, 0, 100);

  // Clients perdus (calculés sur la base de clients du début de mois)
  const churnRate = CONFIG.churn.find((c) => s.pmf < c.below).rate;
  const lostClients = Math.min(s.clients, randomRound(s, s.clients * churnRate));
  changeClients(s, -lostClients);

  // Nouveaux clients
  const sales = staffCount(s, 'sales');
  const boost = s.pmf >= CONFIG.salesPmfThreshold ? CONFIG.salesBoostWithPmf : CONFIG.salesBoostWithoutPmf;
  const expected = s.pmf * CONFIG.growthPerPmf * (1 + sales * boost) * CONFIG.marketGrowth[s.market];
  const newClients = randomRound(s, expected);
  changeClients(s, newClients);

  // Charge de l'équipe
  const load = s.clients / (headcount(s) * CONFIG.clientsPerPerson);
  let teamDelta = CONFIG.teamRecovery;
  if (load > CONFIG.heavyOverloadRatio) teamDelta = CONFIG.teamHeavyOverload;
  else if (load > 1) teamDelta = CONFIG.teamOverload;
  const teamBefore = s.team;
  s.team = clamp(s.team + teamDelta, 0, 100);
  if (load > 1) s.stats.overloadMonths += 1;

  // Rentabilité : les revenus couvrent les charges ET un salaire pour les fondateurs
  const salaryGap = s.flags.foundersPaid ? 0 : CONFIG.founderSalary;
  s.profitStreak = s.mrr >= s.costs + salaryGap ? s.profitStreak + 1 : 0;

  s.stats.minCash = Math.min(s.stats.minCash, s.cash);
  s.stats.peakCosts = Math.max(s.stats.peakCosts, s.costs);
  s.stats.peakMrr = Math.max(s.stats.peakMrr, s.mrr);

  return { revenue, costs, newClients, lostClients, teamDelta: s.team - teamBefore };
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
      s.month >= e.months[0] &&
      s.month <= e.months[1] &&
      !s.seen.includes(e.id) &&
      meets(s, e.when),
  );
  if (pool.length === 0) {
    const fallback = content.events.find((e) => e.fallback);
    return { id: fallback.id, kind: 'fallback' };
  }
  const picked = pickWeighted(s, pool, (e) => (e.weight ?? 1) * (e.category === s.lastCategory ? 0.3 : 1));
  return { id: picked.id, kind: 'event' };
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

export function newGame(seed = Date.now(), content = DEFAULT_CONTENT) {
  const st = CONFIG.start;
  const s = {
    version: SAVE_VERSION,
    seed,
    rng: seed >>> 0,
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
    current: null,
    lastCategory: null,
    result: null,
    ending: null,
    profitStreak: 0,
    history: [],
    stats: { hires: [], overloadMonths: 0, minCash: st.cash, peakCosts: st.costs, peakMrr: 0, spent: {} },
  };
  const first = content.events.find((e) => e.id === 'interviews');
  s.current = { id: first.id, kind: 'event' };
  s.seen.push(first.id);
  s.lastCategory = first.category;
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
    title: event.title,
    choice: choice.label,
    tags: choice.tags || [],
    delta: choiceDelta,
    hire: Boolean(choice.effects?.hire || outcome.effects?.hire),
  });

  const text = outcome.text || choice.text || '';
  let report = null;
  if (outcome.end || choice.end) {
    s.ending = { type: outcome.end || choice.end };
  } else if (s.team <= 0) {
    s.ending = { type: 'team' };
  } else {
    const beforeClose = snapshot(s);
    report = closeMonth(s);
    report.delta = diff(beforeClose, s);
    if (s.cash < 0) s.ending = { type: 'cash' };
    else if (s.team <= 0) s.ending = { type: 'team' };
    else if (s.month >= CONFIG.months) s.ending = { type: 'final' };
  }

  s.result = { choiceLabel: choice.label, text, delta: choiceDelta, report };
  s.phase = 'result';
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
    s.notices.push({ id: cb.id, title: cb.title, text: outcome.text || '', delta: diff(before, s), tone: outcome.tone });
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

  changeMarket(s, content);

  s.current = selectEvent(s, content, forcedId);
  const ev = findEvent(s.current.id, content);
  if (s.current.kind === 'event') s.seen.push(ev.id);
  s.lastCategory = ev.category;
  s.phase = 'event';
  return s;
}
