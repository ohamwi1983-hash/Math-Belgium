/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen60` (`familleA.ts`/
 * `familleB.ts` de ce dossier uniquement) — mirroir du patron `equationConiqueCaracteristiques/
 * aleatoire.ts` (6gen59), jamais importé d'un autre générateur.
 */

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Réduit `num/den` (den>0 imposé) à sa forme irréductible. */
export function reduireFraction(num: number, den: number): { num: number; den: number } {
  const signe = den < 0 ? -1 : 1;
  const n = signe * num;
  const d = signe * den;
  const g = pgcd(n, d);
  return { num: n / g, den: d / g };
}
