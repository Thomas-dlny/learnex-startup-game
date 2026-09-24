import { describe, it, expect } from 'vitest';
import {
  newGame,
  chooseOption,
  nextMonth,
  netBurn,
  runway,
  breakEven,
  visibleChoices,
  currentEvent,
  applyEffects,
  closeMonth,
} from '../src/game/engine.js';
import { CONFIG } from '../src/game/config.js';

// Contenu minimal, indépendant des vraies données du jeu.
const plain = (id, months = [1, 18], extra = {}) => ({
  id,
  months,
  category: 'Test',
  title: id,
  text: '...',
  choices: [
    { label: 'A', hints: [], tags: ['cash'], effects: {} },
    { label: 'B', hints: [], tags: ['product'], effects: { pmf: 5 } },
  ],
  ...extra,
});

function content(overrides = {}) {
  return {
    events: [
      plain('interviews', [1, 1]),
      plain('filler-1'),
      plain('filler-2'),
      plain('filler-3'),
      plain('runway-alert', [1, 18], { urgent: 'runway' }),
      plain('team-crisis', [1, 18], { urgent: 'team' }),
      plain('quiet-month', [1, 18], { fallback: true }),
      ...(overrides.events || []),
    ],
    callbacks: overrides.callbacks || [],
    news: overrides.news || [],
  };
}

// Joue le mois courant avec le choix 0 puis passe au mois suivant.
function playMonth(state, c, choice = 0) {
  return nextMonth(chooseOption(state, choice, c), c);
}

describe('newGame', () => {
  it('starts with the spec values', () => {
    const s = newGame(1, content());
    expect(s.month).toBe(1);
    expect(s.cash).toBe(10000);
    expect(s.costs).toBe(1800);
    expect(s.mrr).toBe(0);
    expect(s.clients).toBe(0);
    expect(s.team).toBe(80);
    expect(s.pmf).toBe(15);
    expect(s.phase).toBe('event');
  });

  it('always opens on the interviews event', () => {
    const s = newGame(42, content());
    expect(s.current.id).toBe('interviews');
  });
});

describe('burn and runway', () => {
  it('computes runway as cash divided by net burn', () => {
    const s = { ...newGame(1, content()), cash: 9000, costs: 2000, mrr: 500 };
    expect(netBurn(s)).toBe(1500);
    expect(runway(s)).toBe(6);
  });

  it('returns Infinity when revenue covers costs', () => {
    const s = { ...newGame(1, content()), costs: 2000, mrr: 2500 };
    expect(netBurn(s)).toBe(0);
    expect(runway(s)).toBe(Infinity);
  });
});

describe('breakEven', () => {
  it('includes founder salaries while founders are unpaid', () => {
    const s = { ...newGame(1, content()), costs: 5000 };
    expect(breakEven(s)).toBe(5000 + CONFIG.founderSalary);
    expect(breakEven({ ...s, flags: { foundersPaid: true } })).toBe(5000);
  });
});

describe('applyEffects', () => {
  it('adds clients at the current price and clamps gauges', () => {
    const s = newGame(1, content());
    applyEffects(s, { clients: 2, team: 50, pmf: -40, cash: -1000 });
    expect(s.clients).toBe(2);
    expect(s.mrr).toBe(2 * CONFIG.start.arpu);
    expect(s.team).toBe(100);
    expect(s.pmf).toBe(0);
    expect(s.cash).toBe(9000);
  });

  it('removes MRR proportionally when clients leave', () => {
    const s = { ...newGame(1, content()), clients: 4, mrr: 2000 };
    applyEffects(s, { clients: -1 });
    expect(s.clients).toBe(3);
    expect(s.mrr).toBe(1500);
  });

  it('hires and fires staff with their monthly cost', () => {
    const s = newGame(1, content());
    applyEffects(s, { hire: { role: 'sales', label: 'Commercial', cost: 3500 } });
    expect(s.costs).toBe(1800 + 3500);
    expect(s.staff).toHaveLength(1);
    applyEffects(s, { fire: 'sales' });
    expect(s.costs).toBe(1800);
    expect(s.staff).toHaveLength(0);
  });
});

describe('applyEffects with several hires', () => {
  it('hires a whole team at once', () => {
    const s = newGame(1, content());
    applyEffects(s, {
      hire: [
        { role: 'sales', label: 'A', cost: 3500 },
        { role: 'dev', label: 'B', cost: 4000 },
      ],
    });
    expect(s.staff).toHaveLength(2);
    expect(s.costs).toBe(1800 + 7500);
  });
});

describe('closeMonth', () => {
  it('adds revenue and pays costs', () => {
    const s = { ...newGame(1, content()), pmf: 0, mrr: 1000, clients: 0 };
    const report = closeMonth(s);
    expect(report.revenue).toBe(1000);
    expect(report.costs).toBe(1800);
    expect(s.cash).toBe(10000 + 1000 - 1800);
  });

  it('grows faster with a higher PMF', () => {
    let low = 0;
    let high = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const a = { ...newGame(seed, content()), pmf: 10 };
      const b = { ...newGame(seed, content()), pmf: 70 };
      low += closeMonth(a).newClients;
      high += closeMonth(b).newClients;
    }
    expect(high).toBeGreaterThan(low * 4);
  });

  it('loses more clients when PMF is low', () => {
    let lowPmfLost = 0;
    let highPmfLost = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const a = { ...newGame(seed, content()), pmf: 10, clients: 20, mrr: 5000 };
      const b = { ...newGame(seed, content()), pmf: 80, clients: 20, mrr: 5000 };
      lowPmfLost += closeMonth(a).lostClients;
      highPmfLost += closeMonth(b).lostClients;
    }
    expect(lowPmfLost).toBeGreaterThan(highPmfLost * 4);
  });

  it('tires the team when clients exceed capacity', () => {
    const s = { ...newGame(1, content()), pmf: 0, clients: 40, mrr: 10000, team: 60 };
    const report = closeMonth(s);
    expect(report.teamDelta).toBeLessThan(0);
  });

  it('lets the team recover when load is fine', () => {
    const s = { ...newGame(1, content()), pmf: 0, team: 60 };
    expect(closeMonth(s).teamDelta).toBeGreaterThan(0);
  });
});

describe('turn flow', () => {
  it('moves from event to result, then to the next month', () => {
    const c = content();
    const s1 = chooseOption(newGame(1, c), 1, c);
    expect(s1.phase).toBe('result');
    expect(s1.result.choiceLabel).toBe('B');
    const s2 = nextMonth(s1, c);
    expect(s2.month).toBe(2);
    expect(s2.phase).toBe('event');
  });

  it('ignores a second choice while showing the result', () => {
    const c = content();
    const s1 = chooseOption(newGame(1, c), 1, c);
    const s2 = chooseOption(s1, 0, c);
    expect(s2).toBe(s1);
  });

  it('does not mutate the previous state', () => {
    const c = content();
    const s0 = newGame(1, c);
    chooseOption(s0, 1, c);
    expect(s0.phase).toBe('event');
    expect(s0.pmf).toBe(15);
  });

  it('is deterministic for the same seed and choices', () => {
    const c = content();
    let a = newGame(7, c);
    let b = newGame(7, c);
    for (let i = 0; i < 6; i++) {
      a = playMonth(a, c, i % 2);
      b = playMonth(b, c, i % 2);
    }
    expect(a).toEqual(b);
  });

  it('does not repeat a pool event in the same run', () => {
    const c = content();
    let s = newGame(3, c);
    const ids = [];
    for (let i = 0; i < 5; i++) {
      s = playMonth({ ...s, cash: 99999 }, c);
      ids.push(s.current.id);
    }
    const pool = ids.filter((id) => id.startsWith('filler'));
    expect(new Set(pool).size).toBe(pool.length);
  });

  it('shows the fallback event when the pool is empty', () => {
    const c = { ...content(), events: content().events.filter((e) => !e.id.startsWith('filler')) };
    const s = playMonth({ ...newGame(1, c), cash: 99999 }, c);
    expect(s.current.id).toBe('quiet-month');
  });

  it('ends the run after month 18', () => {
    const c = content();
    let s = { ...newGame(1, c), cash: 1e7 };
    for (let i = 0; i < 18; i++) s = playMonth(s, c);
    expect(s.phase).toBe('ended');
    expect(s.ending).toBeTruthy();
    expect(s.month).toBe(18);
  });
});

describe('choices', () => {
  it('hides choices whose condition is not met', () => {
    const ev = {
      ...plain('x'),
      choices: [
        { label: 'A', effects: {} },
        { label: 'B', if: { flag: 'angel' }, effects: {} },
      ],
    };
    const s = newGame(1, content());
    expect(visibleChoices(s, ev).map((ch) => ch.label)).toEqual(['A']);
    expect(visibleChoices({ ...s, flags: { angel: true } }, ev)).toHaveLength(2);
  });

  it('picks outcomes according to state-dependent chance', () => {
    const risky = {
      ...plain('interviews', [1, 1]),
      choices: [
        {
          label: 'Tenter',
          outcomes: [
            { chance: { base: 0, pmf: 0.01 }, text: 'win', effects: { cash: 5000 } },
            { text: 'lose', effects: {} },
          ],
        },
      ],
    };
    const c = content({ events: [] });
    c.events[0] = risky;
    let wins = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const s = { ...newGame(seed, c), pmf: 80 };
      if (chooseOption(s, 0, c).result.text === 'win') wins++;
    }
    // chance = 0.8, bornée à 0.95 max
    expect(wins).toBeGreaterThan(200);
    expect(wins).toBeLessThan(280);
  });
});

describe('delayed consequences', () => {
  const withCallback = (callback) => {
    const c = content({ callbacks: [callback] });
    c.events[0] = {
      ...plain('interviews', [1, 1]),
      choices: [{ label: 'Go', effects: {}, delayed: [{ in: 2, id: callback.id }] }],
    };
    return c;
  };

  it('resolves a passive consequence at the right month', () => {
    const c = withCallback({
      id: 'later-cash',
      title: 'Retour',
      outcomes: [{ text: 'Un virement arrive.', effects: { cash: 5000 } }],
    });
    let s = playMonth(newGame(1, c), c); // mois 2
    expect(s.notices).toHaveLength(0);
    s = playMonth(s, c, 0); // mois 3
    expect(s.notices).toHaveLength(1);
    expect(s.notices[0].text).toBe('Un virement arrive.');
    expect(s.notices[0].delta.cash).toBe(5000);
    expect(s.pending).toHaveLength(0);
  });

  it('turns an interactive consequence into the main event', () => {
    const c = withCallback({
      id: 'poc-offer',
      title: 'Le contact revient',
      text: '...',
      choices: [{ label: 'OK', effects: {} }],
    });
    let s = playMonth(newGame(1, c), c);
    s = playMonth({ ...s, cash: 99999 }, c);
    expect(s.month).toBe(3);
    expect(s.current.id).toBe('poc-offer');
  });

  it('lets a passive consequence trigger an interactive event', () => {
    const c = withCallback({
      id: 'seed-result',
      title: 'Levée',
      outcomes: [{ text: 'Un fonds te rappelle.', trigger: 'term-sheet' }],
    });
    c.callbacks.push({ id: 'term-sheet', title: 'Term sheet', text: '...', choices: [{ label: 'Signer', effects: {} }] });
    let s = playMonth(newGame(1, c), c);
    s = playMonth({ ...s, cash: 99999 }, c);
    expect(s.current.id).toBe('term-sheet');
  });
});

describe('failure and safety nets', () => {
  it('ends the run when cash goes below zero', () => {
    const c = content();
    let s = { ...newGame(1, c), cash: 500 };
    s = chooseOption(s, 0, c);
    expect(s.ending.type).toBe('cash');
    s = nextMonth(s, c);
    expect(s.phase).toBe('ended');
  });

  it('ends the run when the team collapses', () => {
    const c = content();
    c.events[0] = { ...plain('interviews', [1, 1]), choices: [{ label: 'Crunch', effects: { team: -200 } }] };
    const s = chooseOption(newGame(1, c), 0, c);
    expect(s.ending.type).toBe('team');
  });

  it('raises a runway alert when less than 2 months remain', () => {
    const c = content();
    const s = nextMonth(chooseOption({ ...newGame(1, c), cash: 5000, costs: 2000 }, 0, c), c);
    expect(s.current.id).toBe('runway-alert');
  });

  it('raises the runway alert at most twice', () => {
    const c = content();
    let s = newGame(1, c);
    const alerts = [];
    for (let i = 0; i < 5; i++) {
      s = nextMonth(chooseOption({ ...s, cash: 2000, costs: 1000, mrr: 0 }, 0, c), c);
      alerts.push(s.current.id);
    }
    expect(alerts.filter((id) => id === 'runway-alert')).toHaveLength(2);
  });

  it('raises the team crisis once when the team is exhausted', () => {
    const c = content();
    let s = newGame(1, c);
    s = nextMonth(chooseOption({ ...s, cash: 99999, team: 20 }, 0, c), c);
    expect(s.current.id).toBe('team-crisis');
    s = nextMonth(chooseOption({ ...s, team: 20 }, 0, c), c);
    expect(s.current.id).not.toBe('team-crisis');
  });
});

describe('currentEvent', () => {
  it('returns the full event object for the current id', () => {
    const c = content();
    const s = newGame(1, c);
    expect(currentEvent(s, c).title).toBe('interviews');
  });
});
