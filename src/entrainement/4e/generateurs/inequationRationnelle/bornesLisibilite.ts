/**
 * Borne de lisibilité commune (audit du chapitre 4) : plus grand nombre admis dans l'énoncé de
 * départ ET dans les coefficients du numérateur combiné. Sans elle, niveau 3 et « sans facteur
 * commun » montaient jusqu'à 549/528 (p90 144) et niveau 4 jusqu'à 1 020 (`6x²+162x+1020`), alors
 * que niveau 1/2 restent sous 18/34 en médiane/p90. Appliquée par rejet dans `construireNiveau3`,
 * `construireNiveau4` et `construireSansFacteurCommun` (≈ 63 % des tirages passent pour les deux
 * premiers, ≈ 0,3 % des tirages bruts de `tirerParametres` pour le niveau 4, dont le tirage est
 * de toute façon très sélectif) — les 3 catégories du numérateur combiné restent représentées.
 */
export const NOMBRE_MAX_LISIBLE = 60;

export function tousLisibles(...nombres: number[]): boolean {
  return nombres.every((n) => Math.abs(n) <= NOMBRE_MAX_LISIBLE);
}
