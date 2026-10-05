/** Petites primitives de tirage aléatoire, partagées par les 7 familles — Couche A. */

export function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Entier dans [min;max], en excluant toute valeur de `exclus`. */
export function tirerEntierExcluant(min: number, max: number, exclus: readonly number[]): number {
  const candidats: number[] = [];
  for (let v = min; v <= max; v++) {
    if (!exclus.includes(v)) candidats.push(v);
  }
  return tirerParmi(candidats);
}

/** Entier non nul dans [min;max] (utile pour c/y0 ≠ 0). */
export function tirerEntierNonNul(min: number, max: number): number {
  return tirerEntierExcluant(min, max, [0]);
}
