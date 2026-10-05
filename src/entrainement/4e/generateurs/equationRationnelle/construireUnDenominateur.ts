import type { ExerciceUnDenominateur } from "../../core/equationRationnelle.types";
import { construireEquationIsolee } from "./construireEquationIsolee";
import { construireDonnees } from "./construireDonnees";

/**
 * Construction "un seul dénominateur" (V1, spec-equations-rationnelles-un-denominateur.md) —
 * logique 100% inchangée (construireEquationIsolee/construireDonnees), simplement enveloppée
 * dans la forme du contrat désormais partagé avec la construction "deux_denominateurs" (ce=[p]).
 */
export function construireUnDenominateur(): ExerciceUnDenominateur {
  const equationIsolee = construireEquationIsolee();
  const { p, q, A } = construireDonnees(equationIsolee);
  // Jamais réductible : l'unique fraction A/(x-p) a un numérateur constant et un dénominateur
  // toujours monique (coefficient 1) — aucun facteur numérique commun possible.
  return { construction: "un_denominateur", p, q, A, ce: [p], equationIsolee, fractionsSimplifiables: [] };
}
