/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen44` (`familleA.ts` à
 * `familleD.ts` de ce dossier uniquement). Mirroir exact de
 * `denombrementFondamental/aleatoire.ts` (6gen43) — jamais importé d'un autre générateur.
 */

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}
