/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen43` (`familleA.ts` à
 * `familleE.ts` de ce dossier uniquement). Délibérément PAS `generateurs6e/calculPrimitives/
 * aleatoire.ts` : ce dossier est propre à `6gen23` ("Calcul de primitives", au sens antidérivée —
 * voir en-tête `generateurs6e/combinatoire.ts` pour le détail de cette décision). Mirroir du patron
 * `probabilitesProblemes/familleB.ts` (helpers locaux, jamais importés d'un autre générateur).
 */

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}
