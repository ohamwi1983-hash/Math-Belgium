/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen45` (`familleA.ts` à
 * `familleC.ts` de ce dossier uniquement). Mirroir `denombrementFondamental/aleatoire.ts` (6gen43).
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
