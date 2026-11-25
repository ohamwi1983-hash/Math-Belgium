import type { ExerciceTangentesConique } from "../../core6e/tangentesConique.types";
import type { PhaseTangentesConique } from "../../moteur6e/typesTangentesConique";
import { phasesPourExercice } from "../../moteur6e/typesTangentesConique";
import { FORMAT_6GEN62 } from "../../ui6e/formatTangentesConique";
import { construireAdaptateurConiques } from "../adaptateurConiques";
import { CATALOGUE_VARIANTES, GROUPES_VERDICT_6GEN62, construireAvecVarianteId, genererExerciceTangentesConique } from "./index";

/**
 * Adaptateur papier de `6gen62` — PROVISOIRE (lots B et C du 6e ch. 10 ; lot E à venir). Réponses de
 * chaque écran rédigées (plus de « voir bloc de travail », P1), hyperbole verticale juste (P2), données
 * en fractions (P3). Groupes à verdict B (existence) et C (position). Aucun `calcul`.
 */
export const adaptateurEvaluationTangentesConique = construireAdaptateurConiques<ExerciceTangentesConique, PhaseTangentesConique>({
  titreDocument: "Tangentes à une conique — Évaluation",
  nomFichierBase: "tangentes-conique",
  genererInstance: genererExerciceTangentesConique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN62,
  phases: phasesPourExercice,
  groupesVerdict: GROUPES_VERDICT_6GEN62,
});
