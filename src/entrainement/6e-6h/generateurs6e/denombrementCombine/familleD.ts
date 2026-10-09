import { coefficientBinomial } from "../combinatoire";
import type { ExerciceDenombCombD } from "../../core6e/denombrementCombine.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille D ("Sélections avec restrictions") de `6gen44`. 3 sous-types,
 * tirés ÉQUIPROBABLEMENT (mission : "alterne aléatoirement entre 'exclusion de paire' et 'couple
 * indissociable' à travers les tirages") — `n`∈{15,...,35}, `k`∈{4,...,8} (`k≤n-4`, marge de
 * sécurité pour que `C(n−2,k−2)`/`C(n−2,k)` restent des cas valides, `combinatoire.ts` gère de toute
 * façon `k<0`/`k>n`→0 sans exception si jamais un cas limite survenait).
 *
 * - "exclusionPaire" : 2 éléments précis (notés X et Y) NE PEUVENT PAS être choisis ensemble parmi
 *   les `k` éléments sélectionnés. `terme1 = C(n,k)` (total sans restriction), `terme2 = C(n−2,k−2)`
 *   (cas où X ET Y sont inclus, à exclure). `resultatFinal = terme1 − terme2`. `typeContrainte =
 *   "exclusion"`.
 * - "coupleIndissociable" : X et Y DOIVENT être choisis ensemble ou pas du tout. `terme1 =
 *   C(n−2,k−2)` (les deux inclus), `terme2 = C(n−2,k)` (les deux exclus). `resultatFinal = terme1 +
 *   terme2`. `typeContrainte = "indissociable"`.
 * - "contrainteRiche" : variante étendue à 2 catégories (`nA`+`nB`=`n`, X et Y tous deux dans la
 *   catégorie A) — MÊME mécanique de comptage que "exclusionPaire" (le partage en catégories est un
 *   habillage narratif, la combinatoire ne distingue pas les catégories tant que la sélection reste
 *   libre sur l'ensemble des `n` éléments) : `typeContrainte = "exclusion"`, mêmes `terme1`/`terme2`.
 */

const N_MIN = 15;
const N_MAX = 35;
const K_MIN = 4;
const K_MAX = 8;

function tirerNK(): { n: number; k: number } {
  const n = tirerEntier(N_MIN, N_MAX);
  const k = tirerEntier(K_MIN, Math.min(K_MAX, n - 4));
  return { n, k };
}

export function construireExclusionPaire(): ExerciceDenombCombD {
  const { n, k } = tirerNK();
  const terme1 = coefficientBinomial(n, k);
  const terme2 = coefficientBinomial(n - 2, k - 2);
  return { famille: "D", sousType: "exclusionPaire", typeContrainte: "exclusion", n, k, terme1, terme2, resultatFinal: terme1 - terme2 };
}

export function construireCoupleIndissociable(): ExerciceDenombCombD {
  const { n, k } = tirerNK();
  const terme1 = coefficientBinomial(n - 2, k - 2);
  const terme2 = coefficientBinomial(n - 2, k);
  return { famille: "D", sousType: "coupleIndissociable", typeContrainte: "indissociable", n, k, terme1, terme2, resultatFinal: terme1 + terme2 };
}

export function construireContrainteRiche(): ExerciceDenombCombD {
  const { n, k } = tirerNK();
  const nA = tirerEntier(4, n - 4); // catégorie A doit pouvoir contenir X et Y (≥4 pour rester réaliste)
  const nB = n - nA;
  const terme1 = coefficientBinomial(n, k);
  const terme2 = coefficientBinomial(n - 2, k - 2);
  return { famille: "D", sousType: "contrainteRiche", typeContrainte: "exclusion", n, k, nA, nB, terme1, terme2, resultatFinal: terme1 - terme2 };
}

const CONSTRUCTEURS_D: (() => ExerciceDenombCombD)[] = [construireExclusionPaire, construireCoupleIndissociable, construireContrainteRiche];

export function construireFamilleD(): ExerciceDenombCombD {
  return tirerParmi(CONSTRUCTEURS_D)();
}
