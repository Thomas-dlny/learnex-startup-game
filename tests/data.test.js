import { describe, it, expect } from 'vitest';
import { EVENTS } from '../src/data/events.js';
import { CALLBACKS } from '../src/data/callbacks.js';
import { NEWS } from '../src/data/news.js';

// Garde-fous pour les personnes qui modifient les fichiers de données.

const EFFECT_KEYS = new Set(['cash', 'mrr', 'clients', 'team', 'pmf', 'costs', 'arpu', 'equity', 'mrrPct', 'arpuPct', 'clientsPct', 'costsPct', 'hire', 'fire', 'flags', 'market']);
const COND_KEYS = new Set(['minPmf', 'maxPmf', 'minMrr', 'maxMrr', 'minCash', 'maxCash', 'minClients', 'maxClients', 'minTeam', 'maxTeam', 'minStaff', 'maxStaff', 'role', 'noRole', 'flag', 'notFlag', 'market']);
const CHANCE_KEYS = new Set(['base', 'pmf', 'team', 'mrr', 'market', 'flags']);
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
    const text = JSON.stringify([EVENTS, CALLBACKS, NEWS]);
    expect(text.includes('—')).toBe(false);
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
