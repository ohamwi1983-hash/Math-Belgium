/** Couche A (6e) — petits helpers de tirage partagés par les 6 familles de `6gen7`. Dupliqués
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

export interface BaseAvecFlag {
  base: number;
  baseEstE: boolean;
}

/** Tire soit `e` (30% du temps), soit un entier dans `[min;max]` — famille A (sous-types) et D. */
export function tirerBaseAvecE(min: number, max: number): BaseAvecFlag {
  if (Math.random() < 0.3) return { base: Math.E, baseEstE: true };
  return { base: tirerEntier(min, max), baseEstE: false };
}
