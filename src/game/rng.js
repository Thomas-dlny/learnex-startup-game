// Générateur pseudo-aléatoire seedé (mulberry32).
// L'état du générateur vit dans l'état de jeu : une partie est rejouable à l'identique.

export function nextRandom(seed) {
  let t = (seed + 0x6d2b79f5) >>> 0;
  let r = Math.imul(t ^ (t >>> 15), t | 1);
  r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
  const value = ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  return { value, seed: t };
}

// Tire un nombre dans [0, 1[ et fait avancer le générateur stocké dans `state.rng`.
export function roll(state) {
  const { value, seed } = nextRandom(state.rng);
  state.rng = seed;
  return value;
}

// Arrondi aléatoire : 2,3 donne 2 (70 %) ou 3 (30 %). Garde la moyenne exacte.
export function randomRound(state, x) {
  const base = Math.floor(x);
  return base + (roll(state) < x - base ? 1 : 0);
}
