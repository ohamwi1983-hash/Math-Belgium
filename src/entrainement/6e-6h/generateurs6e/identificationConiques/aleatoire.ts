/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen58` (`familleA.ts` à
 * `familleC.ts` de ce dossier uniquement) — mirroir du patron `denombrementFondamental/aleatoire.ts`
 * (6gen43), jamais importés d'un autre générateur.
 */

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Signe aléatoire équiprobable, jamais 0. */
export function tirerSigne(): 1 | -1 {
  return tirerParmi([1, -1] as const);
}
