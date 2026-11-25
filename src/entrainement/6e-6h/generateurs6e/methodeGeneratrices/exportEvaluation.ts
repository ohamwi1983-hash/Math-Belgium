import type { ExerciceMethodeGeneratrices } from "../../core6e/methodeGeneratrices.types";
import type { PhaseMethodeGeneratrices } from "../../moteur6e/typesMethodeGeneratrices";
import { phasesPourExercice } from "../../moteur6e/typesMethodeGeneratrices";
import { FORMAT_6GEN57 } from "../../ui6e/formatMethodeGeneratrices";
import { construireAdaptateurLieux } from "../adaptateurLieux";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMethodeGeneratrices } from "./index";

/**
 * Adaptateur papier de `6gen57` — PROVISOIRE (lots B et C du 6e ch. 9 ; lot E à venir : énoncé en
 * prose, corrigé « comme au tableau » avec la figure du lieu). Les données sont désormais en prose
 * (plus de question coupée à l'impression, audit P1). Aucun `calcul`, aucun cas particulier.
 */
export const adaptateurEvaluationMethodeGeneratrices = construireAdaptateurLieux<ExerciceMethodeGeneratrices, PhaseMethodeGeneratrices>({
  titreDocument: "Méthode des génératrices — Évaluation",
  nomFichierBase: "methode-generatrices",
  genererInstance: genererExerciceMethodeGeneratrices,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN57,
  phases: phasesPourExercice,
});
