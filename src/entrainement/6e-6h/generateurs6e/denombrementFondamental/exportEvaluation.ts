import type { ExerciceDenombrementFondamental } from "../../core6e/denombrementFondamental.types";
import type { AdaptateurFeuilleExercices } from "../../../export/genererFeuilleExercices";
import { FORMAT_6GEN43 } from "../../ui6e/formatDenombrementFondamental";
import { phasesPourExercice } from "../../moteur6e/typesDenombrementFondamental";
import { correctionPapierCombinatoire, enoncePapierCombinatoire } from "../adaptateurCombinatoire";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementFondamental } from "./index";

/**
 * Adaptateur papier de `6gen43` — mêmes fonctions de génération que l'appli (`?code=`) et mêmes
 * textes que l'écran (`FORMAT_6GEN43`). Refonte papier complète : lot E de l'audit (à venir).
 */
export const adaptateurEvaluationDenombrementFondamental: AdaptateurFeuilleExercices<ExerciceDenombrementFondamental> = {
  titreDocument: "Dénombrement fondamental et arrangements — Évaluation",
  nomFichierBase: "denombrement-fondamental",
  genererInstance: genererExerciceDenombrementFondamental,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: enoncePapierCombinatoire(FORMAT_6GEN43, phasesPourExercice),
  construireCorrection: correctionPapierCombinatoire(FORMAT_6GEN43, phasesPourExercice),
};
