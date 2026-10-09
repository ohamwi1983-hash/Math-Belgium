import { coefficientBinomial } from "../combinatoire";
import type { ExerciceDenombCombC } from "../../core6e/denombrementCombine.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Combinaisons avec répétition et distinguabilité") de
 * `6gen44`. 2 sous-types.
 *
 * - "repetition" (ex. dominos) : `n`∈{5,...,15} valeurs possibles, choisir 2 valeurs, répétition
 *   autorisée, ordre sans importance. `resultat = C(n,2) + n` (= `C(n+1,2)`, technique de bijection
 *   classique — voir aide niveau 1, `ui6e/formatDenombrementCombine.ts`).
 * - "comparaison" (ex. deux dés) : `n`∈{4,...,10} faces/valeurs possibles par objet, 2 objets.
 *   `resultatDiscernable = n²` (objets discernables, ex. couleurs différentes — résultats ORDONNÉS).
 *   `resultatIndiscernable = C(n+1,2)` (objets indiscernables — résultats NON ORDONNÉS avec
 *   répétition).
 */

export function construireRepetition(): ExerciceDenombCombC {
  const n = tirerEntier(5, 15);
  const resultat = coefficientBinomial(n, 2) + n;
  return { famille: "C", sousType: "repetition", n, resultat };
}

export function construireComparaison(): ExerciceDenombCombC {
  const n = tirerEntier(4, 10);
  const resultatDiscernable = n * n;
  const resultatIndiscernable = coefficientBinomial(n + 1, 2);
  return { famille: "C", sousType: "comparaison", n, resultatDiscernable, resultatIndiscernable };
}

const CONSTRUCTEURS_C: (() => ExerciceDenombCombC)[] = [construireRepetition, construireComparaison];

export function construireFamilleC(): ExerciceDenombCombC {
  return tirerParmi(CONSTRUCTEURS_C)();
}
