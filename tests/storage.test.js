import { describe, it, expect } from 'vitest';
import { createStorage, SAVE_VERSION } from '../src/game/storage.js';

function memory() {
  const data = {};
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
    data,
  };
}

const broken = {
  getItem: () => { throw new Error('denied'); },
  setItem: () => { throw new Error('denied'); },
  removeItem: () => { throw new Error('denied'); },
};

const run = (over = {}) => ({ type: 'cash', monthsSurvived: 7, stats: { mrr: 1000 }, profile: { id: 'growth' }, positive: false, ...over });

describe('records', () => {
  it('starts empty', () => {
    const r = createStorage(memory()).loadRecords();
    expect(r.runs).toEqual([]);
    expect(r.bestMonths).toBeNull();
  });

  it('keeps the best survival and unlocked endings', () => {
    const st = createStorage(memory());
    st.saveRun(run({ monthsSurvived: 7 }));
    st.saveRun(run({ monthsSurvived: 11, type: 'team' }));
    st.saveRun(run({ monthsSurvived: 5 }));
    const r = st.loadRecords();
    expect(r.runs).toHaveLength(3);
    expect(r.bestMonths).toBe(11);
    expect(r.endings).toEqual(expect.arrayContaining(['cash', 'team']));
  });

  it('keeps only the last 20 runs', () => {
    const st = createStorage(memory());
    for (let i = 0; i < 25; i++) st.saveRun(run());
    expect(st.loadRecords().runs).toHaveLength(20);
    expect(st.loadRecords().totalRuns).toBe(25);
  });

  it('ignores corrupted data', () => {
    const m = memory();
    m.setItem('sig.records.v1', '{oops');
    expect(createStorage(m).loadRecords().runs).toEqual([]);
  });

  it('keeps the in-memory history when storage throws', () => {
    const st = createStorage(broken);
    const first = st.saveRun(run({ monthsSurvived: 6 }));
    const second = st.saveRun(run({ monthsSurvived: 9 }), first);
    expect(second.runs).toHaveLength(2);
    expect(second.bestMonths).toBe(9);
  });

  it('survives a storage that throws', () => {
    const st = createStorage(broken);
    expect(() => st.saveRun(run())).not.toThrow();
    expect(st.loadRecords().runs).toEqual([]);
    expect(st.loadCurrent()).toBeNull();
  });
});

describe('current run', () => {
  it('saves and restores an unfinished run', () => {
    const st = createStorage(memory());
    st.saveCurrent({ version: SAVE_VERSION, month: 4, phase: 'event' });
    expect(st.loadCurrent().month).toBe(4);
    st.clearCurrent();
    expect(st.loadCurrent()).toBeNull();
  });

  it('drops a save from another version', () => {
    const st = createStorage(memory());
    st.saveCurrent({ version: SAVE_VERSION - 1, month: 4, phase: 'event' });
    expect(st.loadCurrent()).toBeNull();
  });
});

describe('V2 records', () => {
  it('keeps milestones, played paths and the last startup across runs', () => {
    const st = createStorage(memory());
    st.saveRun(run({ path: 'saas', name: 'Glane', milestones: ['first-client'] }));
    st.saveRun(run({ path: 'bootstrap', name: 'Popote', milestones: ['first-client', 'mrr-1k'] }));
    const r = st.loadRecords();
    expect(r.milestones).toEqual(['first-client', 'mrr-1k']);
    expect(r.pathsPlayed).toEqual(['saas', 'bootstrap']);
    expect(r.lastPath).toBe('bootstrap');
    expect(r.lastName).toBe('Popote');
  });

  it('upgrades V1 records without the new fields', () => {
    const m = memory();
    m.setItem('sig.records.v1', JSON.stringify({ runs: [], totalRuns: 3, bestMonths: 9, bestMrr: 0, endings: ['cash'] }));
    const r = createStorage(m).loadRecords();
    expect(r.totalRuns).toBe(3);
    expect(r.milestones).toEqual([]);
    expect(r.pathsPlayed).toEqual([]);
  });

  it('remembers that the tutorial was seen', () => {
    const st = createStorage(memory());
    expect(st.tutorialDone()).toBe(false);
    st.setTutorialDone();
    expect(st.tutorialDone()).toBe(true);
  });
});
