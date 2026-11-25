import type { ExerciceExtA, ExerciceExtD, ExerciceExtensionsBinomialeNormaleBayes, ExerciceExtF } from "../core6e/extensionsBinomialeNormaleBayes.types";
import { frontiereA } from "../generateurs6e/extensionsBinomialeNormaleBayes/familles";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { Attente } from "./attentesCombinatoire";
import { rationnel } from "./saisieCombinatoire";
import type { Rationnel } from "./saisieCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { entier, inequationEnN, valeurExacte, valeurExacteOuArrondie } from "./saisieVariablesAleatoires";
import { phasesPourExercice } from "./typesExtensionsBinomialeNormaleBayes";
import type { PhaseExtensionsBinomialeNormaleBayes } from "./typesExtensionsBinomialeNormaleBayes";

/**
 * Vérification de `6gen52` — EXACTE (audit, G5 : la tolérance de 0,01 acceptait « 0 » dans 31 % des B
 * et q₃ pour r₃ dans 10 % des D). Probabilités : exactes, ou arrondies correctement avec au moins
 * 3 décimales et 2 chiffres significatifs ; inéquations jugées par leur ensemble de solutions.
 */

export function pA(e: ExerciceExtA): number {
  return e.pNum / e.pDen;
}

export function referenceA(e: ExerciceExtA): (n: number) => boolean {
  const p = pA(e);
  return (n) => 1 - (1 - p) ** n > e.seuil;
}

export function totaleD(e: ExerciceExtD): Rationnel {
  return rationnel(e.q[0] * e.r[0] + e.q[1] * e.r[1] + e.q[2] * e.r[2], 10000);
}
export function intersectionD(e: ExerciceExtD): Rationnel {
  return rationnel(e.q[e.j] * e.r[e.j], 10000);
}
export function bayesD(e: ExerciceExtD): Rationnel {
  return rationnel(e.q[e.j] * e.r[e.j], e.q[0] * e.r[0] + e.q[1] * e.r[1] + e.q[2] * e.r[2]);
}

export function probabilitesF(e: ExerciceExtF): [number, number, number] {
  return [e.pourcentage1 / 100, e.pourcentage2 / 100, (100 - e.pourcentage1 - e.pourcentage2) / 100];
}
export function esperanceF(e: ExerciceExtF): number {
  return (e.valeurs[0] * e.pourcentage1 + e.valeurs[1] * e.pourcentage2 + e.valeurs[2] * (100 - e.pourcentage1 - e.pourcentage2)) / 100;
}
export function totalF(e: ExerciceExtF): number {
  return Math.round(esperanceF(e) * e.population * 100) / 100;
}

export function attentesExtensions(e: ExerciceExtensionsBinomialeNormaleBayes, p: PhaseExtensionsBinomialeNormaleBayes): Attente[] {
  if (e.famille === "A") {
    const f = frontiereA(pA(e), e.seuil);
    if (p === "aP") return [valeurExacte(pA(e))];
    if (p === "aInequation") return [inequationEnN(referenceA(e), f)];
    if (p === "aIsole") return [inequationEnN(referenceA(e), f, true)];
    return [entier(e.valeurN)];
  }
  if (e.famille === "D") {
    if (p === "dTotale") return [{ nature: "probabilite", cible: totaleD(e) }];
    if (p === "dIntersection") return [{ nature: "probabilite", cible: intersectionD(e) }];
    return [{ nature: "probabilite", cible: bayesD(e) }];
  }
  if (p === "fLoi") return probabilitesF(e).map((x) => valeurExacte(x));
  if (p === "fEsperance") return [valeurExacteOuArrondie(esperanceF(e), 2)];
  return [valeurExacte(totalF(e))];
}

export const DEFINITION_6GEN52: DefinitionSession<ExerciceExtensionsBinomialeNormaleBayes, PhaseExtensionsBinomialeNormaleBayes> = {
  phases: phasesPourExercice,
  estChoix: () => false,
  diagnostiquer: (e, p, valeurs) => diagnostiquerAttentes(attentesExtensions(e, p), valeurs),
};
