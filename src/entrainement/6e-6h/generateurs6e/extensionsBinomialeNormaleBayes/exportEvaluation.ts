import type { ExerciceExtensionsBinomialeNormaleBayes } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import { FORMAT_6GEN52 } from "../../ui6e/formatExtensionsBinomialeNormaleBayes";
import { phasesPourExercice } from "../../moteur6e/typesExtensionsBinomialeNormaleBayes";
import type { PhaseExtensionsBinomialeNormaleBayes } from "../../moteur6e/typesExtensionsBinomialeNormaleBayes";
import { construireAdaptateurProvisoire } from "../adaptateurVariablesAleatoires";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceExtensionsBinomialeNormaleBayes } from "./index";

/**
 * Adaptateur papier de `6gen52` — PROVISOIRE (lot C ; lot E à venir). Variantes retirées gardées dans
 * le catalogue (`retiree`, filtrées par le panneau). Profil : aucune réponse « directe » à la
 * calculatrice (modéliser, Bayes, loi reconstruite) ; A exige le logarithme →
 * `calculatriceIndispensable`.
 */
export const adaptateurEvaluationExtensionsBinomialeNormaleBayes = construireAdaptateurProvisoire<ExerciceExtensionsBinomialeNormaleBayes, PhaseExtensionsBinomialeNormaleBayes>({
  titreDocument: "Extensions binomiale, normale et Bayes — Évaluation",
  nomFichierBase: "extensions-binomiale-normale-bayes",
  genererInstance: genererExerciceExtensionsBinomialeNormaleBayes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN52,
  phases: phasesPourExercice,
  profilInstance: () => ({ casParticulier: null }),
  calculatriceIndispensable: ["A_compose", "A_direct"],
});
