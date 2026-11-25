import type { ExerciceEquationConiqueCaracteristiques } from "../../core6e/equationConiqueCaracteristiques.types";
import type { PhaseEquationConiqueCaracteristiques } from "../../moteur6e/typesEquationConiqueCaracteristiques";
import { phasesPourExercice } from "../../moteur6e/typesEquationConiqueCaracteristiques";
import { FORMAT_6GEN59 } from "../../ui6e/formatEquationConiqueCaracteristiques";
import { construireAdaptateurConiques } from "../adaptateurConiques";
import { CATALOGUE_VARIANTES, GROUPES_VERDICT_6GEN59, construireAvecVarianteId, genererExerciceEquationConiqueCaracteristiques } from "./index";

/**
 * Adaptateur papier de `6gen59` — PROVISOIRE (lots B et C du 6e ch. 10 ; lot E à venir). Nature
 * (ellipse / hyperbole) = VERDICT : groupes à verdict A « même axe » et C (décision 3). Aucun `calcul`.
 */
export const adaptateurEvaluationEquationConiqueCaracteristiques = construireAdaptateurConiques<ExerciceEquationConiqueCaracteristiques, PhaseEquationConiqueCaracteristiques>({
  titreDocument: "Équation d'une conique — Évaluation",
  nomFichierBase: "equation-conique-caracteristiques",
  genererInstance: genererExerciceEquationConiqueCaracteristiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN59,
  phases: phasesPourExercice,
  groupesVerdict: GROUPES_VERDICT_6GEN59,
});
