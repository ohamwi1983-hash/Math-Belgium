/** Couche A (6e) — petits helpers de tirage pour `6gen19`. Dupliqués plutôt qu'importés d'un autre
 * générateur — convention déjà établie sur ce chantier (voir
 * `generateurs6e/domaineDeriveeLogarithme/aleatoire.ts`, `6gen16`). */

export function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

const COEFFICIENTS_NON_NULS = [-3, -2, -1, 1, 2, 3] as const;

/** Coefficient entier dans {-3,...,-1,1,...,3} — jamais 0 (combinaison dégénérée sinon). Utilisé
 * par les familles B ("trouverCh"), C et D. */
export function tirerCoefficientNonNul(): number {
  return tirerParmi(COEFFICIENTS_NON_NULS);
}
