import { factorielle } from "../combinatoire";
import type { ExerciceDenombrementE } from "../../core6e/denombrementFondamental.types";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille E ("Permutations circulaires") de `6gen43`. `n`∈{5,6,7,8}
 * objets/personnes DISTINCTS disposés en cercle.
 * - "table" (seules les rotations sont équivalentes) : `(n-1)!` arrangements distincts.
 * - "collier"/bracelet (rotations ET réflexions équivalentes) : `(n-1)!/2` arrangements distincts.
 * Les 2 formules sont vérifiées PAR FORCE BRUTE dans `familleE.test.ts` (petit `n`, énumération
 * exhaustive des classes d'équivalence) — voir mission, "vérifier une affirmation combinatoire
 * empiriquement avant de la faire confiance".
 */

const VALEURS_N = [5, 6, 7, 8] as const;

export function calculerArrangementsCirculaires(n: number, sousType: "table" | "collier"): number {
  const table = factorielle(n - 1);
  return sousType === "table" ? table : table / 2;
}

export function construireTable(n: number = tirerParmi(VALEURS_N)): ExerciceDenombrementE {
  return { famille: "E", sousType: "table", n, resultat: calculerArrangementsCirculaires(n, "table") };
}

export function construireCollier(n: number = tirerParmi(VALEURS_N)): ExerciceDenombrementE {
  return { famille: "E", sousType: "collier", n, resultat: calculerArrangementsCirculaires(n, "collier") };
}

export function construireFamilleE(): ExerciceDenombrementE {
  return tirerParmi([construireTable, construireCollier] as const)();
}
