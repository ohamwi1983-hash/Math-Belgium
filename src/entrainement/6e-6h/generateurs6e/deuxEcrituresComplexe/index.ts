import type { ExerciceDeuxEcritures, Facteur, IdVarianteDeuxEcritures } from "../../core6e/deuxEcrituresComplexe";

export type { IdVarianteDeuxEcritures };

/**
 * Couche A (6e) — générateur de `6gen94` « Valeurs exactes par deux écritures d'un même complexe ».
 * N'utilise QUE `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue exactement
 * le même tirage, dans l'appli comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * Un facteur de la famille de π/4 (c(±1 ± i), 4 arguments) et un facteur de la famille de π/6 ou π/3
 * (d(±√3 ± i) ou d(±1 ± i√3), 8 arguments), dans un ordre tiré au hasard ; coefficients
 * (c ; d) ∈ {(1 ; 1), (2 ; 1), (1 ; 2)} (jamais les deux à 2 : les calculs grossiraient sans rien
 * apprendre de plus). 4 × 8 × 3 × 2 = 192 énoncés distincts par variante ; l'argument de z parcourt
 * les huit angles ±π/12, ±5π/12, ±7π/12, ±11π/12 (voir `core6e/deuxEcrituresComplexe.ts`).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

const ARGUMENTS_QUART = [3, 9, -3, -9];
const ARGUMENTS_SIXIEME = [2, 10, -2, -10, 4, 8, -4, -8];
const COEFFICIENTS: [number, number][] = [
  [1, 1],
  [2, 1],
  [1, 2],
];

export const CATALOGUE_VARIANTES: { id: IdVarianteDeuxEcritures; label: string }[] = [
  { id: "produit", label: "Produit : z = (1 + i)(√3 + i)… — forme algébrique, forme trigonométrique, puis cos et sin exacts" },
  { id: "quotient", label: "Quotient : z = (1 + i)/(√3 + i)… — conjugué, modules et arguments, puis cos et sin exacts" },
];

export function construireAvecVarianteId(id: IdVarianteDeuxEcritures): ExerciceDeuxEcritures {
  const [c, d] = parmi(COEFFICIENTS);
  const quart: Facteur = { famille: "quart", t: parmi(ARGUMENTS_QUART), coef: c };
  const sixieme: Facteur = { famille: "sixieme", t: parmi(ARGUMENTS_SIXIEME), coef: d };
  const quartEnPremier = Math.random() < 0.5;
  return { variante: id, z1: quartEnPremier ? quart : sixieme, z2: quartEnPremier ? sixieme : quart };
}

/** Tirage libre : les deux variantes à parts égales. */
export function genererExerciceDeuxEcritures(): ExerciceDeuxEcritures {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
