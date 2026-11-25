import type { ExerciceIdentificationConiques } from "../../core6e/identificationConiques.types";
import type { PhaseIdentificationConiques } from "../../moteur6e/typesIdentificationConiques";
import { phasesPourExercice } from "../../moteur6e/typesIdentificationConiques";
import { FORMAT_6GEN58 } from "../../ui6e/formatIdentificationConiques";
import { construireAdaptateurConiques } from "../adaptateurConiques";
import { CATALOGUE_VARIANTES, GROUPES_VERDICT_6GEN58, construireAvecVarianteId, genererExerciceIdentificationConiques } from "./index";

/**
 * Adaptateur papier de `6gen58` — PROVISOIRE (lots B et C du 6e ch. 10 ; lot E à venir). La nature est
 * un VERDICT : groupes à verdict (décision 3) pour les quatre familles, jamais dans `forme`. Aucun
 * `calcul` (règle du 24/11 : décider une nature, réduire une équation).
 */
export const adaptateurEvaluationIdentificationConiques = construireAdaptateurConiques<ExerciceIdentificationConiques, PhaseIdentificationConiques>({
  titreDocument: "Identifier une conique — Évaluation",
  nomFichierBase: "identification-coniques",
  genererInstance: genererExerciceIdentificationConiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN58,
  phases: phasesPourExercice,
  groupesVerdict: GROUPES_VERDICT_6GEN58,
});
