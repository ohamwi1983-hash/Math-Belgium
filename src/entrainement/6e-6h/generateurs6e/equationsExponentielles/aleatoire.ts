/** Couche A (6e) — petits helpers de tirage partagés par les 4 familles de `6gen9`. Dupliqués
 * plutôt qu'importés d'un autre générateur — convention déjà établie sur ce chantier (voir
 * `generateurs6e/limitesExponentielles/aleatoire.ts`). */

export function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function tirerEntierNonNul(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = tirerEntier(min, max);
  return v;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Tire 2 éléments DISTINCTS (sans remise) dans `candidats`. */
export function tirerDeuxDistincts<T>(candidats: readonly T[]): [T, T] {
  const a = tirerParmi(candidats);
  let b = tirerParmi(candidats);
  while (b === a) b = tirerParmi(candidats);
  return [a, b];
}
