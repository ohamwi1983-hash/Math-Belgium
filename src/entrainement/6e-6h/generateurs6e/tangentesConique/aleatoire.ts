/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen62` (ce dossier
 * uniquement) — mirroir du patron `identificationConiques/aleatoire.ts`/
 * `equationConiqueCaracteristiques/aleatoire.ts`, jamais importé d'un autre générateur.
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

export function pgcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Réduit `num/den` à sa forme irréductible, dénominateur toujours positif. */
export function reduireFraction(num: number, den: number): { num: number; den: number } {
  const signe = den < 0 ? -1 : 1;
  const n = signe * num;
  const d = signe * den;
  const g = pgcd(n, d);
  return { num: n / g, den: d / g };
}
