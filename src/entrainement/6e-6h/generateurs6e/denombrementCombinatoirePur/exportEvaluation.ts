import type { ExerciceDenombrementCombinatoirePur } from "../../core6e/denombrementCombinatoirePur.types";
import type { AdaptateurFeuilleExercices } from "../../../export/genererFeuilleExercices";
import { FORMAT_6GEN46 } from "../../ui6e/formatDenombrementCombinatoirePur";
import { phasesPourExercice } from "../../moteur6e/typesDenombrementCombinatoirePur";
import { correctionPapierCombinatoire, enoncePapierCombinatoire } from "../adaptateurCombinatoire";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementCombinatoirePur } from "./index";

/**
 * Adaptateur papier de `6gen46` — mêmes fonctions de génération que l'appli (`?code=`) et mêmes
 * textes que l'écran (`FORMAT_6GEN46`). Refonte papier complète : lot E de l'audit (à venir).
 */
export const adaptateurEvaluationDenombrementCombinatoirePur: AdaptateurFeuilleExercices<ExerciceDenombrementCombinatoirePur> = {
  titreDocument: "Dénombrement combinatoire pur : problèmes — Évaluation",
  nomFichierBase: "denombrement-combinatoire-pur",
  genererInstance: genererExerciceDenombrementCombinatoirePur,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: enoncePapierCombinatoire(FORMAT_6GEN46, phasesPourExercice),
  construireCorrection: correctionPapierCombinatoire(FORMAT_6GEN46, phasesPourExercice),
};
