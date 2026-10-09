/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen63` (`familleUnique.ts` de
 * ce dossier uniquement) — mirroir du patron `intersectionsConiques/aleatoire.ts` (6gen61), jamais
 * importé d'un autre générateur.
 */

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Signe aléatoire équiprobable, jamais 0. */
export function tirerSigne(): 1 | -1 {
  return tirerParmi([1, -1] as const);
}
