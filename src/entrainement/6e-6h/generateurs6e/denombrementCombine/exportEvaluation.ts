import type { ExerciceDenombrementCombine } from "../../core6e/denombrementCombine.types";
import type { AdaptateurFeuilleExercices } from "../../../export/genererFeuilleExercices";
import { FORMAT_6GEN44 } from "../../ui6e/formatDenombrementCombine";
import { phasesPourExercice } from "../../moteur6e/typesDenombrementCombine";
import { correctionPapierCombinatoire, enoncePapierCombinatoire } from "../adaptateurCombinatoire";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementCombine } from "./index";

/**
 * Adaptateur papier de `6gen44` — mêmes fonctions de génération que l'appli (`?code=`) et mêmes
 * textes que l'écran (`FORMAT_6GEN44`). Refonte papier complète : lot E de l'audit (à venir).
 */
export const adaptateurEvaluationDenombrementCombine: AdaptateurFeuilleExercices<ExerciceDenombrementCombine> = {
  titreDocument: "Dénombrement combiné et sélections contraintes — Évaluation",
  nomFichierBase: "denombrement-combine",
  genererInstance: genererExerciceDenombrementCombine,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: enoncePapierCombinatoire(FORMAT_6GEN44, phasesPourExercice),
  construireCorrection: correctionPapierCombinatoire(FORMAT_6GEN44, phasesPourExercice),
};
