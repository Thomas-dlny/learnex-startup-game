import { describe, it, expect } from 'vitest';
import { eur, signedEur, runwayLabel, zeroCashMonth, fr } from '../src/game/format.js';

describe('format', () => {
  it('formats euros with a space as thousands separator', () => {
    expect(eur(18450)).toBe('18 450 €');
    expect(eur(-1200)).toBe('-1 200 €');
  });

  it('signs deltas', () => {
    expect(signedEur(4000)).toBe('+4 000 €');
    expect(signedEur(-250)).toBe('-250 €');
  });

  it('labels runway for humans', () => {
    expect(runwayLabel(Infinity)).toBe('Rentable');
    expect(runwayLabel(8.7)).toBe('8 mois');
    expect(runwayLabel(0.4)).toBe('< 1 mois');
    expect(runwayLabel(40)).toBe('24+ mois');
  });

  it('projects the month when cash hits zero', () => {
    // 3 000 € de cash, 1 000 € de burn : 2 000, 1 000, 0, puis -1 000 au 4e mois clôturé
    expect(zeroCashMonth({ cash: 3000, costs: 1000, mrr: 0 }, 5)).toBe(8);
    expect(zeroCashMonth({ cash: 2500, costs: 1000, mrr: 0 }, 5)).toBe(7);
    expect(zeroCashMonth({ cash: 2500, costs: 1000, mrr: 1000 }, 5)).toBeNull();
  });
});

describe('fr', () => {
  it('glues French punctuation to the previous word', () => {
    expect(fr('Par quoi tu commences ?')).toBe('Par quoi tu commences ?');
    expect(fr('« Je signe »')).toBe('« Je signe »');
  });
});
