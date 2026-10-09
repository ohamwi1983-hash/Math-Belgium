/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen48` (`familleA.ts`/
 * `familleB.ts` de ce dossier uniquement) — mirroir `generateurs6e/denombrementFondamental/
 * aleatoire.ts` (6gen43).
 */

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}
