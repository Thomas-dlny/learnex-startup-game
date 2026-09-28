import { NEWS } from '../data/news.js';
import { fr } from '../game/format.js';

const MARKET = { morose: 'Marché morose', normal: 'Marché normal', euphorique: 'Marché euphorique' };
const FLAVOR = NEWS.filter((n) => !n.mood);

// Bandeau ACTU : la news de marché quand elle tombe (puis un mois sur deux),
// sinon une brève d'ambiance. L'humeur du marché reste affichée à droite.
export default function NewsTicker({ state }) {
  const showMarket = state.news && (state.news.fresh || state.month % 2 === 0);
  const text = showMarket ? state.news.text : FLAVOR[(state.month - 1) % FLAVOR.length]?.text;
  if (!text) return null;
  return (
    <aside className={`ticker${state.news?.fresh ? ' is-fresh' : ''}`} aria-label="Actualité du marché">
      <span className="ticker-tag">ACTU</span>
      <p className="ticker-text">{fr(text)}</p>
      <span className={`ticker-market market-${state.market}`}>{MARKET[state.market]}</span>
    </aside>
  );
}
