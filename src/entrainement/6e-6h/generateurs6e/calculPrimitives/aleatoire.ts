/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire partagés par les 7 fichiers
 * `familles/{A..G}.ts` de `6gen23` (Couche A ↔ Couche A, réutilisation libre — CLAUDE.md).
 */

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Entier non nul dans [min,max] (retire 0 s'il tombe dans la plage, redemande). */
export function tirerEntierNonNul(min: number, max: number): number {
  let v = 0;
  do {
    v = tirerEntier(min, max);
  } while (v === 0);
  return v;
}

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}
