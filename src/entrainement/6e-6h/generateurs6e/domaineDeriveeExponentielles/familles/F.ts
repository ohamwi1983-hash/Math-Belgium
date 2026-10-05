import type { ExerciceDomaineDeriveeF } from "../../../core6e/domaineDeriveeExponentielles.types";
import { ensembleReel, ensembleUnMorceau, intervalleFerme } from "../../ensembleReel";
import { tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille F — composition triple, trig/cyclométrique (2 écrans : domaine, dérivée).
 * f(x) = trig(e^(x²−k)), trig∈{cos,arccos}.
 *
 * Domaine — `cos` : ℝ (k n'intervient jamais dans le domaine, seulement dans la dérivée) ; k reste
 * libre sur {1,...,5} (littéral spec). `arccos` : nécessite `e^(x²−k) ∈ [-1;1]` — la contrainte
 * `≥-1` est TOUJOURS automatiquement vérifiée (une exponentielle est TOUJOURS strictement positive,
 * donc jamais `<-1`) — seule `e^(x²−k)≤1 ⟺ x²≤k` est réellement contraignante, domaine `[-√k;√k]`.
 * `k` restreint à `{1,4}` (carrés parfaits dans `{1,...,5}`) pour ce sous-cas UNIQUEMENT — voir la
 * note de conception dans `core6e/domaineDeriveeExponentielles.types.ts`.
 *
 * Dérivée (chaîne à 3 niveaux, v=x²−k, w=e^v, f=trig(w)) — w'(x)=2x·e^(x²−k) :
 * `cos` : f'(x) = −sin(e^(x²−k))·2x·e^(x²−k).
 * `arccos` : f'(x) = −2x·e^(x²−k)/√(1−e^(2(x²−k))) (dérivée de arccos(w) = −1/√(1−w²)).
 */
export function construireF(): ExerciceDomaineDeriveeF {
  const trig = tirerParmi(["cos", "arccos"] as const);
  if (trig === "cos") {
    const k = tirerEntier(1, 5);
    return { famille: "F", trig, k, domaine: ensembleReel() };
  }
  const k = tirerParmi([1, 4] as const);
  const racineK = Math.sqrt(k);
  return { famille: "F", trig, k, domaine: ensembleUnMorceau(intervalleFerme(-racineK, racineK)) };
}

export function evaluerFF(exercice: ExerciceDomaineDeriveeF, x: number): number {
  const w = Math.exp(x * x - exercice.k);
  return exercice.trig === "cos" ? Math.cos(w) : Math.acos(w);
}
