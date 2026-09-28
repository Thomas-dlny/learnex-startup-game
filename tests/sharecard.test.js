import { describe, it, expect } from 'vitest';
import { cardFromRun, shareText } from '../src/components/ShareCard.jsx';

describe('cardFromRun', () => {
  it('rebuilds a result card from a stored run', () => {
    const card = cardFromRun({
      runNumber: 4,
      type: 'funded',
      monthsSurvived: 18,
      stats: { clients: 32, mrr: 9400, pmf: 58, team: 61 },
      profile: { id: 'fundraise', name: 'Le Fundraiser' },
      path: 'saas',
      pathLabel: 'SaaS B2B',
      name: 'BigPapa',
      headline: 'BigPapa lève avec de la traction',
    });
    expect(card).toMatchObject({ runNumber: 4, name: 'BigPapa', pathLabel: 'SaaS B2B', positive: true, monthsSurvived: 18 });
    expect(card.stats.mrr).toBe(9400);
    expect(shareText(card)).toContain('BigPapa lève avec de la traction');
    expect(shareText(card)).toContain('32 clients');
  });

  it('handles runs saved by the first version, without name or path', () => {
    const card = cardFromRun({ runNumber: 1, type: 'cash', monthsSurvived: 7, stats: { mrr: 1000 }, profile: { id: 'growth', name: 'Le Growth Hacker' } });
    expect(card.name).toBe('Glane');
    expect(card.pathLabel).toBe('SaaS B2B');
    expect(card.headline).toBe('Glane ferme après 7 mois');
    expect(card.stats.clients).toBe(0);
  });
});
