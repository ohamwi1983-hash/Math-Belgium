/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen50` (`familleA.ts`/
 * `familleB.ts`/`familleC.ts` de ce dossier uniquement) — mirroir `generateurs6e/
 * binomialeSequenceOrdonnee/aleatoire.ts` (6gen48), duplication assumée (voir CLAUDE.md).
 */

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}
