import { describe, it, expect } from 'vitest';
import { evaluateFinal, buildRecap, profileOf } from '../src/game/endings.js';

// État final minimal pour tester les fins sans jouer une partie.
function finalState(over = {}) {
  return {
    month: 18,
    cash: 20000,
    costs: 1800,
    mrr: 2000,
    clients: 8,
    team: 60,
    pmf: 30,
    equity: 100,
    staff: [],
    flags: {},
    profitStreak: 0,
    ending: { type: 'final' },
    history: [],
    stats: { hires: [], overloadMonths: 0, minCash: 5000, peakCosts: 1800, peakMrr: 2000, spent: {} },
    ...over,
  };
}

const h = (tags, extra = {}) => ({ month: 1, eventId: 'x', title: 't', choice: 'c', tags, delta: {}, ...extra });

describe('evaluateFinal', () => {
  it('is only a survival when revenue does not pay the founders', () => {
    expect(evaluateFinal(finalState({ mrr: 2500, profitStreak: 0 }))).toBe('survivor');
  });

  it('is profitable after 3 months covering costs and founder salaries', () => {
    expect(evaluateFinal(finalState({ mrr: 6000, profitStreak: 3 }))).toBe('profitable');
  });

  it('is not profitable with an exhausted team', () => {
    expect(evaluateFinal(finalState({ mrr: 6000, profitStreak: 3, team: 10 }))).toBe('survivor');
  });

  it('counts a raise only with traction', () => {
    expect(evaluateFinal(finalState({ flags: { raised: true }, pmf: 30, mrr: 3000 }))).toBe('survivor');
    expect(evaluateFinal(finalState({ flags: { raised: true }, pmf: 50, mrr: 6000 }))).toBe('funded');
  });

  it('prefers profitable over funded when both apply', () => {
    expect(evaluateFinal(finalState({ flags: { raised: true }, pmf: 50, mrr: 9000, profitStreak: 4 }))).toBe('profitable');
  });
});

describe('profileOf', () => {
  it('uses the dominant tag', () => {
    const history = [h(['growth']), h(['growth']), h(['growth']), h(['product'])];
    expect(profileOf(finalState({ history }), 'cash').id).toBe('growth');
  });

  it('is balanced when no tag dominates', () => {
    const history = ['growth', 'product', 'sales', 'cash', 'recruit', 'corporate', 'fundraise'].map((t) => h([t]));
    expect(profileOf(finalState({ history }), 'survivor').id).toBe('balanced');
  });

  it('is a bootstrapper when profitable without raising money', () => {
    const history = [h(['sales']), h(['sales']), h(['product'])];
    expect(profileOf(finalState({ history }), 'profitable').id).toBe('bootstrap');
  });
});

describe('buildRecap', () => {
  it('blames early hiring when staff costs ate the cash', () => {
    const s = finalState({
      month: 9,
      cash: -800,
      mrr: 1200,
      costs: 5300,
      staff: [{ role: 'sales', cost: 3500, since: 5 }],
      ending: { type: 'cash' },
      stats: { hires: [{ month: 5, role: 'sales', mrr: 700, pmf: 22 }], overloadMonths: 0, minCash: -800, peakCosts: 5300, peakMrr: 1200, spent: {} },
    });
    const r = buildRecap(s, { runs: [] });
    expect(r.cause.id).toBe('hired-too-early');
    expect(r.monthsSurvived).toBe(9);
    expect(r.positive).toBe(false);
  });

  it('blames paid growth without PMF', () => {
    const s = finalState({ cash: -100, pmf: 22, month: 8, ending: { type: 'cash' }, stats: { ...finalState().stats, spent: { growth: 9000 } } });
    expect(buildRecap(s, { runs: [] }).cause.id).toBe('growth-without-pmf');
  });

  it('explains a team collapse caused by overload', () => {
    const s = finalState({ team: 0, month: 14, ending: { type: 'team' }, stats: { ...finalState().stats, overloadMonths: 6 } });
    expect(buildRecap(s, { runs: [] }).cause.id).toBe('overload');
  });

  it('explains a survival that covers costs but not founder salaries', () => {
    const s = finalState({ mrr: 7000, costs: 6000, pmf: 50 });
    expect(buildRecap(s, { runs: [] }).cause.id).toBe('survivor-no-salary');
  });

  it('explains a survival with an exhausted team', () => {
    const s = finalState({ mrr: 12000, costs: 6000, pmf: 55, team: 15, profitStreak: 5 });
    expect(buildRecap(s, { runs: [] }).cause.id).toBe('survivor-tired');
  });

  it('compares with the previous best run', () => {
    const s = finalState({ month: 11, cash: -10, ending: { type: 'cash' } });
    const r = buildRecap(s, { runs: [{ monthsSurvived: 7 }], bestMonths: 7 });
    expect(r.runNumber).toBe(2);
    expect(r.previousBest).toBe(7);
    expect(r.newRecord).toBe(true);
  });

  it('numbers runs from the total count, not the capped history', () => {
    const runs = Array.from({ length: 20 }, () => ({ monthsSurvived: 5 }));
    const r = buildRecap(finalState({ month: 6, cash: -1, ending: { type: 'cash' } }), { runs, totalRuns: 25, bestMonths: 9 });
    expect(r.runNumber).toBe(26);
  });

  it('keeps at most 3 key decisions, in month order', () => {
    const history = [
      h(['growth'], { month: 2, delta: { cash: -4000 } }),
      h(['cash'], { month: 3, delta: {} }),
      h(['recruit'], { month: 6, delta: { costs: 3500 }, hire: true }),
      h(['product'], { month: 8, delta: { pmf: 12 } }),
      h(['cash'], { month: 9, delta: { cash: -100 } }),
    ];
    const r = buildRecap(finalState({ history }), { runs: [] });
    expect(r.keyDecisions.map((d) => d.month)).toEqual([2, 6, 8]);
  });
});
