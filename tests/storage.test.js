import { describe, it, expect } from 'vitest';
import { createStorage } from '../src/game/storage.js';

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
    st.saveCurrent({ version: 1, month: 4, phase: 'event' });
    expect(st.loadCurrent().month).toBe(4);
    st.clearCurrent();
    expect(st.loadCurrent()).toBeNull();
  });

  it('drops a save from another version', () => {
    const st = createStorage(memory());
    st.saveCurrent({ version: 0, month: 4, phase: 'event' });
    expect(st.loadCurrent()).toBeNull();
  });
});
