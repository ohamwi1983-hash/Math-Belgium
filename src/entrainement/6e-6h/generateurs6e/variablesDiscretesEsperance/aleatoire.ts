/**
 * Couche A (6e) — petits utilitaires de tirage aléatoire PROPRES à `6gen49` (`familleA.ts` à
 * `familleC.ts` de ce dossier uniquement) — mirroir `denombrementFondamental/aleatoire.ts` (6gen43).
 */

export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

export function tirerBooleen(probabiliteVrai = 0.5): boolean {
  return Math.random() < probabiliteVrai;
}

/**
 * PGCD (Euclide) — utilisé par la Couche A pour ne JAMAIS livrer une fraction de probabilité déjà
 * réduite au niveau des données brutes (`psNumerateurs`/`psDenominateur` restent EXACTS, non
 * réduits — la réduction est un pur affichage, `ui6e/formatVariablesDiscretesEsperance.ts`), mais
 * sert aussi ici à réduire `loi[i].probabiliteNumerateur/Denominateur` construits par composition
 * de fractions (famille B/C, effectif/total).
 */
export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/**
 * Compose `m` poids entiers strictement positifs sommant exactement à `total` (tirage "stars and
 * bars" : `m-1` coupures DISTINCTES tirées dans `[1,total-1]`, triées, puis différences
 * successives) — utilisé par les 3 familles pour produire des probabilités "décimales propres"
 * (mission famille A : "table construite avec des décimales propres sommant exactement à 1") :
 * avec `total=20`, chaque poids/20 est un multiple exact de 0,05, jamais un décimal parasite
 * (ex. 1/3). Nécessite `total>=m` (chaque poids >=1) — jamais vérifié ici, à la charge de
 * l'appelant (plages `familleA.ts`/`familleB.ts`/`familleC.ts` garantissent `total` largement
 * supérieur au `m` maximal utilisé, voir leurs tests de génération en masse).
 */
export function genererPoids(m: number, total: number): number[] {
  const coupures = new Set<number>();
  while (coupures.size < m - 1) {
    coupures.add(tirerEntier(1, total - 1));
  }
  const bornes = [0, ...Array.from(coupures).sort((a, b) => a - b), total];
  const poids: number[] = [];
  for (let i = 0; i < bornes.length - 1; i++) poids.push(bornes[i + 1] - bornes[i]);
  return poids;
}
