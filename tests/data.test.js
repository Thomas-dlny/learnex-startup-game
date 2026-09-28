import { describe, it, expect } from 'vitest';
import { EVENTS } from '../src/data/events.js';
import { CALLBACKS } from '../src/data/callbacks.js';
import { NEWS } from '../src/data/news.js';
import { PATHS } from '../src/data/paths.js';
import { GLOSSARY, termByName, splitTerms } from '../src/data/glossary.js';
import { MILESTONES } from '../src/data/milestones.js';
import { GENERIC_ADVICE } from '../src/data/characters.js';

// Garde-fous pour les personnes qui modifient les fichiers de données.

const EFFECT_KEYS = new Set(['cash', 'mrr', 'clients', 'team', 'pmf', 'costs', 'arpu', 'equity', 'mrrPct', 'arpuPct', 'clientsPct', 'costsPct', 'hire', 'fire', 'flags', 'market']);
const COND_KEYS = new Set(['minPmf', 'maxPmf', 'minMrr', 'maxMrr', 'minCash', 'maxCash', 'minClients', 'maxClients', 'minTeam', 'maxTeam', 'minStaff', 'maxStaff', 'minMonth', 'role', 'noRole', 'flag', 'notFlag', 'market', 'path']);
const CHANCE_KEYS = new Set(['base', 'pmf', 'team', 'mrr', 'growth', 'market', 'flags']);
const TAGS = new Set(['growth', 'product', 'sales', 'cash', 'recruit', 'corporate', 'fundraise', 'team']);
const STAGES = new Set(['flash', 'breaking', 'alert']);

const all = [...EVENTS, ...CALLBACKS];
const ids = new Set(all.map((e) => e.id));
const callbackIds = new Set(CALLBACKS.map((c) => c.id));

function* choicesOf(e) {
  for (const ch of e.choices || []) yield [`${e.id} / ${ch.label}`, ch];
}
function* outcomesOf(e) {
  for (const [where, ch] of choicesOf(e)) for (const o of ch.outcomes || []) yield [where, o];
  for (const o of e.outcomes || []) yield [e.id, o];
}

describe('data files', () => {
  it('have unique ids', () => {
    expect(ids.size).toBe(all.length);
  });

  it('have enough content for replay', () => {
    expect(EVENTS.filter((e) => !e.urgent && !e.fallback).length).toBeGreaterThanOrEqual(30);
    expect(CALLBACKS.length).toBeGreaterThanOrEqual(15);
    expect(NEWS.filter((n) => n.mood).length).toBeGreaterThanOrEqual(6);
  });

  it('contain the events the engine needs', () => {
    expect(EVENTS.find((e) => e.id === 'interviews')).toBeTruthy();
    expect(EVENTS.filter((e) => e.fallback)).toHaveLength(1);
    expect(EVENTS.find((e) => e.urgent === 'runway')).toBeTruthy();
    expect(EVENTS.find((e) => e.urgent === 'team')).toBeTruthy();
  });

  it('only point to consequences that exist', () => {
    for (const e of all) {
      for (const [where, ch] of choicesOf(e)) for (const d of ch.delayed || []) expect(callbackIds.has(d.id), `${where} -> ${d.id}`).toBe(true);
      for (const [where, o] of outcomesOf(e)) {
        for (const d of o.delayed || []) expect(callbackIds.has(d.id), `${where} -> ${d.id}`).toBe(true);
        if (o.trigger) expect(callbackIds.has(o.trigger), `${where} trigger ${o.trigger}`).toBe(true);
      }
    }
  });

  it('use known effect, condition and chance keys', () => {
    const check = (where, obj, allowed) => {
      for (const k of Object.keys(obj || {})) expect(allowed.has(k), `${where}: clé inconnue "${k}"`).toBe(true);
    };
    for (const e of all) {
      check(e.id, e.when, COND_KEYS);
      for (const [where, ch] of choicesOf(e)) {
        check(where, ch.effects, EFFECT_KEYS);
        check(where, ch.if, COND_KEYS);
      }
      for (const [where, o] of outcomesOf(e)) {
        check(where, o.effects, EFFECT_KEYS);
        check(where, o.if, COND_KEYS);
        check(where, o.chance, CHANCE_KEYS);
      }
    }
  });

  it('give every interactive event 2 or 3 choices and a readable card', () => {
    for (const e of all.filter((x) => x.choices)) {
      const unconditional = e.choices.filter((ch) => !ch.if).length;
      if (!e.urgent) expect(e.choices.length, e.id).toBeGreaterThanOrEqual(2);
      if (!e.urgent) expect(e.choices.length, e.id).toBeLessThanOrEqual(3);
      expect(unconditional + (e.urgent ? 1 : 0), e.id).toBeGreaterThanOrEqual(1);
      expect(e.title && e.text && e.category, e.id).toBeTruthy();
      if (e.stage) expect(STAGES.has(e.stage), e.id).toBe(true);
      for (const [where, ch] of choicesOf(e)) {
        expect(ch.label, where).toBeTruthy();
        for (const t of ch.tags || []) expect(TAGS.has(t), `${where}: tag ${t}`).toBe(true);
      }
    }
  });

  it('keep pool events inside the 18 months', () => {
    for (const e of EVENTS) {
      expect(e.months[0], e.id).toBeGreaterThanOrEqual(1);
      expect(e.months[1], e.id).toBeLessThanOrEqual(18);
      expect(e.months[0], e.id).toBeLessThanOrEqual(e.months[1]);
    }
  });

  it('never use a long dash', () => {
    const text = JSON.stringify([EVENTS, CALLBACKS, NEWS, GLOSSARY, PATHS, MILESTONES.map((m) => m.label), GENERIC_ADVICE.map((a) => a.text)]);
    expect(text.includes('—')).toBe(false);
  });

  it('only target known paths, with a first event for each', () => {
    for (const e of all) {
      for (const p of e.paths || []) expect(PATHS[p], `${e.id}: parcours ${p}`).toBeTruthy();
      if (e.weight && typeof e.weight === 'object') {
        for (const p of Object.keys(e.weight)) expect(PATHS[p] || p === 'default', `${e.id}: poids ${p}`).toBeTruthy();
      }
      const texts = [e.title, e.text].filter((t) => t && typeof t === 'object');
      for (const t of texts) expect(t.default ?? Object.keys(PATHS).every((p) => t[p]), e.id).toBeTruthy();
    }
    for (const p of Object.values(PATHS)) {
      const first = EVENTS.find((e) => e.id === p.first);
      expect(first, p.id).toBeTruthy();
      expect(first.months, p.id).toEqual([1, 1]);
    }
  });

  it('give each path enough events to replay', () => {
    for (const p of Object.keys(PATHS)) {
      const pool = EVENTS.filter((e) => !e.urgent && !e.fallback && (!e.paths || e.paths.includes(p)));
      expect(pool.length, p).toBeGreaterThanOrEqual(28);
    }
  });

  it('keep the three pools distinct', () => {
    const only = (p) => EVENTS.filter((e) => e.paths && e.paths.length === 1 && e.paths[0] === p).length;
    expect(only('bootstrap')).toBeGreaterThanOrEqual(4);
    expect(only('deeptech')).toBeGreaterThanOrEqual(7);
  });

  it('only use placeholders the game knows', () => {
    const text = JSON.stringify([EVENTS, CALLBACKS]);
    const used = new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]));
    for (const p of used) expect(['name', 'mentor', 'investor'], p).toContain(p);
  });

  it('make Thomas and Robin, and Gaspard, recurring characters', () => {
    const mentorEvents = all.filter((e) => e.speaker === 'mentor');
    expect(mentorEvents.length).toBeGreaterThanOrEqual(8);
    const gaspard = all.filter((e) => JSON.stringify(e).includes('Gaspard') || JSON.stringify(e).includes('gaspard'));
    expect(gaspard.length).toBeGreaterThanOrEqual(4);
  });

  it('give each lesson at most two sentences', () => {
    for (const [where, ch] of all.flatMap((e) => [...choicesOf(e)])) {
      if (ch.lesson) expect(ch.lesson.split(/[.!?] /).length, where).toBeLessThanOrEqual(3);
    }
  });
});

describe('glossary', () => {
  it('defines every term the brief asks for, in one short sentence', () => {
    for (const t of ['MVP', 'MRR', 'Burn', 'Runway', 'PMF', 'POC', 'Pivot', 'Seed', 'VC', 'ARR', 'Term sheet', 'Business angel', 'Bootstrap']) {
      const entry = termByName(t);
      expect(entry, t).toBeTruthy();
      expect(entry.def.length, t).toBeLessThan(170);
    }
  });

  it('finds terms inside a sentence, once each', () => {
    const parts = splitTerms('Un POC payant, puis un autre POC. Ton MVP tourne.');
    const terms = parts.filter((p) => typeof p !== 'string').map((p) => p.entry.term);
    expect(terms).toEqual(['POC', 'MVP']);
    expect(parts.map((p) => (typeof p === 'string' ? p : p.text)).join('')).toBe('Un POC payant, puis un autre POC. Ton MVP tourne.');
  });

  it('does not match a term inside a longer word', () => {
    const parts = splitTerms('Le VCR et les burnouts.');
    expect(parts.every((p) => typeof p === 'string')).toBe(true);
  });
});

describe('milestones', () => {
  it('have unique ids and readable labels', () => {
    expect(new Set(MILESTONES.map((m) => m.id)).size).toBe(MILESTONES.length);
    for (const m of MILESTONES) expect(m.label && m.icon && typeof m.test === 'function', m.id).toBeTruthy();
  });

  it('never show more than 3 choices at once for urgent events', () => {
    // Les options conditionnelles des urgences sont mutuellement exclusives par paires.
    for (const e of EVENTS.filter((x) => x.urgent)) {
      const shown = (s) => e.choices.filter((ch) => {
        const c = ch.if || {};
        return (c.minStaff === undefined || s.staff >= c.minStaff) && (c.maxStaff === undefined || s.staff <= c.maxStaff) &&
          (!c.flag || [].concat(c.flag).every((f) => s[f])) && (!c.notFlag || [].concat(c.notFlag).every((f) => !s[f]));
      }).length;
      for (const staff of [0, 1]) for (const savingsUsed of [false, true]) for (const angel of [false, true]) {
        const n = shown({ staff, savingsUsed, angel });
        expect(n, `${e.id} staff=${staff} savings=${savingsUsed} angel=${angel}`).toBeLessThanOrEqual(3);
        expect(n, `${e.id} staff=${staff} savings=${savingsUsed} angel=${angel}`).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
