/** Couche A (6e) — petits helpers de tirage partagés par les 7 familles de `6gen6`. Dupliqués
 * plutôt qu'importés d'un autre générateur — convention déjà établie sur ce chantier (voir
 * `generateurs6e/equationsExponentielles/aleatoire.ts`). */

export function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function tirerEntierNonNul(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = tirerEntier(min, max);
  return v;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Base d'exponentielle générique (H/I/J/K/N) — entiers 2 à 7, jamais 1 ni `e` (déjà couvert par
 * le cas particulier `ln(e)=1`, qui n'a pas besoin d'être tiré au sort pour apparaître ailleurs). */
export function tirerBaseExponentielle(): number {
  return tirerEntier(2, 7);
}

/** Point vers lequel x tend, pour les familles L'Hôpital H/I/J/K — entier -3 à 3, y COMPRIS 0 (le
 * cas « classique » reste une possibilité parmi d'autres, pas la seule). */
export function tirerPointLimite(): number {
  return tirerEntier(-3, 3);
}
