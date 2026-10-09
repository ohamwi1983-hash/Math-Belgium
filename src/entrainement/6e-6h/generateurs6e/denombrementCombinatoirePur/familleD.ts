import type { DecompositionSommeDes, ExerciceDenombCombPurD } from "../../core6e/denombrementCombinatoirePur.types";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille D ("Comptage de triplets ordonnés pour une somme donnée") de
 * `6gen46`. NOUVEAUTÉ. `n=3` dés à `f=6` faces (fixes), comparaison du nombre de TRIPLETS ORDONNÉS
 * distincts menant à 2 sommes cibles `s1`≠`s2` — le "paradoxe" historique du Chevalier de Méré
 * (9 et 10 admettent chacun 6 décompositions/partitions non ordonnées, mais 25 triplets ordonnés
 * pour 9 contre 27 pour 10 : le nombre de partitions ne suffit PAS à comparer les probabilités,
 * seul le compte ORDONNÉ compte réellement).
 *
 * ============================================================================
 * **`decompositionsSomme` — fonction pure, testée contre la table connue 3d6 (voir
 * `familleD.test.ts`)**
 * ============================================================================
 * Énumère par force brute (espace minuscule, `f³` au plus = 216 triplets pour `f=6`) tous les
 * triplets `(a,b,c)` avec `1≤a≤b≤c≤f` et `a+b+c=somme` (donc DÉJÀ triés croissant, jamais de tri
 * a posteriori nécessaire côté consommateur), puis calcule pour chacun son nombre d'arrangements
 * ORDONNÉS distincts (nombre de permutations DISTINCTES de ce multiset de 3 valeurs) : 3 valeurs
 * toutes différentes → `3!=6` ; exactement une paire → `3!/2!=3` ; les 3 identiques → `3!/3!=1`.
 */
export function decompositionsSomme(somme: number, n: number, f: number): DecompositionSommeDes[] {
  if (n !== 3) throw new Error("decompositionsSomme : seul n=3 dés est implémenté");
  const resultat: DecompositionSommeDes[] = [];
  for (let a = 1; a <= f; a++) {
    for (let b = a; b <= f; b++) {
      const c = somme - a - b;
      if (c < b || c > f) continue;
      const distinctes = new Set([a, b, c]).size;
      const arrangements = distinctes === 3 ? 6 : distinctes === 2 ? 3 : 1;
      resultat.push({ valeurs: [a, b, c], arrangements });
    }
  }
  return resultat;
}

/** Paires `[s1,s2]` de sommes PROCHES (écart de 1, toutes deux dans une plage centrale riche en
 * décompositions) — la mission cite `{9,10}` (le paradoxe historique) comme cas de base, généralisé
 * ici à quelques paires voisines pour varier le tirage sans jamais sortir du domaine [3,18]. Un
 * ordre `[a,b]` désigne `s1=a, s2=b` (le sens narratif "somme 1" / "somme 2" de l'énoncé, pas un
 * ordre de grandeur). */
const PAIRES_SOMMES: readonly [number, number][] = [
  [9, 10],
  [10, 9],
  [8, 9],
  [9, 8],
  [11, 12],
  [12, 11],
  [7, 8],
  [8, 7],
  [12, 13],
  [13, 12],
];

export function construireFamilleD(): ExerciceDenombCombPurD {
  const [s1, s2] = tirerParmi(PAIRES_SOMMES);
  const decompositionsS1 = decompositionsSomme(s1, 3, 6);
  const decompositionsS2 = decompositionsSomme(s2, 3, 6);
  const totalS1 = decompositionsS1.reduce((acc, d) => acc + d.arrangements, 0);
  const totalS2 = decompositionsS2.reduce((acc, d) => acc + d.arrangements, 0);
  const comparaison: ExerciceDenombCombPurD["comparaison"] = totalS1 > totalS2 ? "s1" : totalS1 < totalS2 ? "s2" : "egal";
  return { famille: "D", n: 3, f: 6, s1, s2, decompositionsS1, decompositionsS2, totalS1, totalS2, comparaison };
}
