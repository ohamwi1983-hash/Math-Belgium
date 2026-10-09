/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen54` (`familleA.ts` à
 * `familleH.ts` de ce dossier uniquement). Mirroir exact de `generateurs6e/
 * denombrementFondamental/aleatoire.ts` — jamais importé d'un autre générateur.
 */

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}
