import type { ExerciceLoiPoisson, ExerciceLoiPoissonA } from "../core6e/loiPoisson.types";
import { nombreTermesB, resultatB } from "../generateurs6e/loiPoisson/familles";
import { probabilitePoisson } from "../generateurs6e/loiPoisson/poisson";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { Attente } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { valeurArrondie, valeurExacte } from "./saisieVariablesAleatoires";
import { phasesPourExercice } from "./typesLoiPoisson";
import type { PhaseLoiPoisson } from "./typesLoiPoisson";

/**
 * Vérification de `6gen53` (audit, G6) : consigne d'arrondi EXPLICITE (« arrondie à 10⁻⁴ ») ; une
 * écriture exacte (« e^(−6)·6^4/4! ») est jugée exactement, un décimal doit avoir 4 décimales (moins :
 * refus sans tentative) et être l'arrondi correct — ou, pour une somme, la somme de termes arrondis
 * chacun à 10⁻⁴ (tolérance d'une demi-unité par terme). λ : valeur exacte.
 */

export function lambdaA(e: ExerciceLoiPoissonA): number {
  return (e.n * e.pCentiemes) / 100;
}

export function attentesLoiPoisson(e: ExerciceLoiPoisson, p: PhaseLoiPoisson): Attente[] {
  if (e.famille === "A") {
    if (p === "aVerdict") return [{ choix: e.approximable ? "oui" : "non" }];
    if (p === "aCondition") return [{ choix: e.condition ?? "" }];
    if (p === "aLambda") return [valeurExacte(lambdaA(e))];
    return [valeurArrondie(probabilitePoisson(lambdaA(e), e.k), { decimales: 4 })];
  }
  if (p === "bLambda") return [valeurExacte(e.lambda)];
  return [valeurArrondie(resultatB(e), { decimales: 4, tolerance: (nombreTermesB(e) - 1) * 0.5e-4 })];
}

export const DEFINITION_6GEN53: DefinitionSession<ExerciceLoiPoisson, PhaseLoiPoisson> = {
  phases: phasesPourExercice,
  estChoix: (_e, p) => p === "aVerdict" || p === "aCondition",
  diagnostiquer: (e, p, valeurs) => diagnostiquerAttentes(attentesLoiPoisson(e, p), valeurs),
};
