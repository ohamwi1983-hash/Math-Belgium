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

/** Mélange de Fisher–Yates (non biaisé — `sort(() => Math.random() − 0,5)` l'était). */
export function melanger<T>(liste: readonly T[]): T[] {
  const r = [...liste];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
