/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen56` (`familleA.ts` à
 * `familleE.ts` de ce dossier uniquement) — mirroir `denombrementFondamental/aleatoire.ts` (6gen43).
 */

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Entier non nul dans [-max,-min] ∪ [min,max] (évite 0, utile pour un décalage/coefficient). */
export function tirerEntierNonNul(min: number, max: number): number {
  const v = tirerEntier(min, max);
  return tirerParmi([1, -1] as const) * v;
}
