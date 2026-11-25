import type { ExerciceLoiBinomiale, ExerciceLoiBinomialeC } from "../core6e/loiBinomiale.types";
import { loiBinomialeExacte } from "../generateurs6e/loiBinomiale/familleB";
import { frontiereC } from "../generateurs6e/loiBinomiale/familleC";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { Attente } from "./attentesCombinatoire";
import { rationnel } from "./saisieCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { entier, inequationEnN, valeurArrondie, valeurExacte } from "./saisieVariablesAleatoires";
import { phasesPourExercice } from "./typesLoiBinomiale";
import type { PhaseLoiBinomiale } from "./typesLoiBinomiale";

/**
 * Vérification de `6gen50` — exacte (audit, G5 : la tolérance de 0,01 acceptait « 0 », l'oubli de
 * Cₙᵏ et le mauvais complément). Probabilités de la loi : fraction exacte ou arrondi au millième
 * (2 chiffres significatifs au moins) ; p : décimal, fraction ou pourcentage (« 20 % », écrit comme
 * dans l'énoncé) ; σ : exacte (√…) ou arrondie au centième ; inéquations jugées par leur ensemble de
 * solutions (« > » ou « ≥ », sens de l'écriture libre).
 */

export function referenceC(e: ExerciceLoiBinomialeC): (n: number) => boolean {
  return (n) => 1 - (1 - e.p) ** n > e.seuil;
}

export function esperanceEtVariance(n: number, p: number): { E: number; V: number } {
  return { E: Math.round(n * p * 1e6) / 1e6, V: Math.round(n * p * (1 - p) * 1e6) / 1e6 };
}

export function attentesLoiBinomiale(e: ExerciceLoiBinomiale, p: PhaseLoiBinomiale): Attente[] {
  if (e.famille === "A") {
    if (p === "aVerdict") return [{ choix: e.binomiale ? "oui" : "non" }];
    if (p === "aParametres") return [entier(e.n), valeurExacte(rationnel(e.pNum, e.pDen))];
    return [{ choix: e.condition ?? "" }];
  }
  if (e.famille === "B") {
    if (p === "bLoi") return loiBinomialeExacte(e.n, e.p).map((cible) => ({ nature: "probabilite", cible }));
    if (p === "bDiagramme") return [{ choix: String(e.ordreDiagrammes.indexOf("juste") + 1) }];
    const { E, V } = esperanceEtVariance(e.n, e.p);
    if (p === "bEV") return [valeurExacte(E), valeurExacte(V)];
    return [valeurArrondie(Math.sqrt(V), { decimales: 2 })];
  }
  const f = frontiereC(e.p, e.seuil);
  if (p === "cInequation") return [inequationEnN(referenceC(e), f)];
  if (p === "cIsole") return [inequationEnN(referenceC(e), f, true)];
  return [entier(e.valeurN)];
}

export const DEFINITION_6GEN50: DefinitionSession<ExerciceLoiBinomiale, PhaseLoiBinomiale> = {
  phases: phasesPourExercice,
  estChoix: (_e, p) => p === "aVerdict" || p === "aCondition" || p === "bDiagramme",
  diagnostiquer: (e, p, valeurs) => diagnostiquerAttentes(attentesLoiBinomiale(e, p), valeurs),
};
