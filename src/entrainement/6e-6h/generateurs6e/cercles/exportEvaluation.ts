import type { ExerciceCercles } from "../../core6e/cercles.types";
import type { PhaseCercles } from "../../moteur6e/typesCercles";
import { phasesPourExercice } from "../../moteur6e/typesCercles";
import { FORMAT_6GEN55 } from "../../ui6e/formatCercles";
import { construireAdaptateurLieux } from "../adaptateurLieux";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCercles } from "./index";

/**
 * Adaptateur papier de `6gen55` — PROVISOIRE (lots B et C du 6e ch. 9 ; lot E à venir). Famille B :
 * le nombre de cercles est un VERDICT tiré dans chaque série (jamais dans `forme`). Aucun `calcul` :
 * établir une médiatrice, un centre, une équation de cercle n'est pas donné par la calculatrice.
 */
export const adaptateurEvaluationCercles = construireAdaptateurLieux<ExerciceCercles, PhaseCercles>({
  titreDocument: "Cercles — Évaluation",
  nomFichierBase: "cercles",
  genererInstance: genererExerciceCercles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN55,
  phases: phasesPourExercice,
});
