import type { ExerciceBinomeNewton } from "../../core6e/binomeNewton.types";
import type { AdaptateurFeuilleExercices, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { FORMAT_6GEN45 } from "../../ui6e/formatBinomeNewton";
import { phasesPourExercice } from "../../moteur6e/typesBinomeNewton";
import { correctionPapierCombinatoire, enoncePapierCombinatoire } from "../adaptateurCombinatoire";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBinomeNewton } from "./index";

/**
 * Adaptateur papier de `6gen45` — mêmes fonctions de génération que l'appli (`?code=`) et mêmes
 * textes que l'écran (`FORMAT_6GEN45`). Refonte papier complète : lot E de l'audit (à venir).
 */

/** Profil (tirage équilibré) : aucun cas particulier ni `forme`. Règle du 24/11 (Casio Graph Math+) :
 * `exacte` seulement si la calculatrice donne directement la réponse — D (nombres du triangle :
 * touche nCr). C est devenue une approximation (1 + nε, terme négligé : démarche évaluée) : plus de
 * `calcul` (avant : « calcule 0,99³ exactement », `exacte`). A et B : pas de `calcul`. */
export function profilBinomeNewton(exercice: ExerciceBinomeNewton): ProfilInstance {
  return exercice.famille === "D" ? { casParticulier: null, calcul: "exacte" } : { casParticulier: null };
}

export const adaptateurEvaluationBinomeNewton: AdaptateurFeuilleExercices<ExerciceBinomeNewton> = {
  titreDocument: "Binôme de Newton — Évaluation",
  nomFichierBase: "binome-newton",
  genererInstance: genererExerciceBinomeNewton,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: enoncePapierCombinatoire(FORMAT_6GEN45, phasesPourExercice),
  construireCorrection: correctionPapierCombinatoire(FORMAT_6GEN45, phasesPourExercice),
  profilInstance: profilBinomeNewton,
};
