/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen52` (`familleA.ts` à
 * `familleF.ts` de ce dossier uniquement) — mirroir `denombrementFondamental/aleatoire.ts`, jamais
 * importé d'un autre générateur (chaque générateur reste indépendant, CLAUDE.md).
 */

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}
