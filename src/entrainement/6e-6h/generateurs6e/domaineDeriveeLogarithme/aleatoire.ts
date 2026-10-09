/** Couche A (6e) — petits helpers de tirage partagés par les 7 familles de `6gen16`. Dupliqués
 * plutôt qu'importés d'un autre générateur — convention déjà établie sur ce chantier (voir
 * `generateurs6e/domaineDeriveeExponentielles/aleatoire.ts`, `6gen7`). */

export function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

export interface BaseAvecFlag {
  base: number;
  baseEstE: boolean;
}

const BASES_LOG = [2, 3, 5, 7, 10] as const;

/** Tire soit `e` (30% du temps), soit un entier dans `{2,3,5,7,10}` (spec littérale pour les
 * familles A/C/D qui admettent `e`). */
export function tirerBaseLogAvecE(): BaseAvecFlag {
  if (Math.random() < 0.3) return { base: Math.E, baseEstE: true };
  return { base: tirerParmi(BASES_LOG), baseEstE: false };
}

/** Base TOUJOURS entière dans `{2,3,5,7,10}` — familles B/F, qui excluent `e` explicitement. */
export function tirerBaseLogEntiere(): number {
  return tirerParmi(BASES_LOG);
}
