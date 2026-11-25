import type { ExerciceVariablesDiscretesEsperance } from "../../core6e/variablesDiscretesEsperance.types";
import { donneesPapier49, FORMAT_6GEN49 } from "../../ui6e/formatVariablesDiscretesEsperance";
import { phasesPourExercice } from "../../moteur6e/typesVariablesDiscretesEsperance";
import { construireAdaptateurProvisoire } from "../adaptateurVariablesAleatoires";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVariablesDiscretesEsperance } from "./index";

/**
 * Adaptateur papier de `6gen49` — PROVISOIRE (lots B et C ; la refonte papier est le lot E) : mêmes
 * textes que l'écran, la loi de A imprimée en prose (rien n'est coupé), profil sans calculatrice
 * (toutes les valeurs sont exactes ; la démarche est évaluée, aucune réponse « directe »).
 */
export const adaptateurEvaluationVariablesDiscretesEsperance = construireAdaptateurProvisoire<ExerciceVariablesDiscretesEsperance, ReturnType<typeof phasesPourExercice>[number]>({
  titreDocument: "Variables aléatoires discrètes et espérance — Évaluation",
  nomFichierBase: "variables-discretes-esperance",
  genererInstance: genererExerciceVariablesDiscretesEsperance,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN49,
  phases: phasesPourExercice,
  donneesPapier: donneesPapier49,
  profilInstance: () => ({ casParticulier: null }),
});
