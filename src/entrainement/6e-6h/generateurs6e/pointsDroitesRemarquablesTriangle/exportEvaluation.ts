import type { ExercicePointsDroitesRemarquablesTriangle } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import type { PhasePointsDroitesRemarquablesTriangle } from "../../moteur6e/typesPointsDroitesRemarquablesTriangle";
import { phasesPourExercice } from "../../moteur6e/typesPointsDroitesRemarquablesTriangle";
import { FORMAT_6GEN54 } from "../../ui6e/formatPointsDroitesRemarquablesTriangle";
import { construireAdaptateurLieux } from "../adaptateurLieux";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointsDroitesRemarquablesTriangle } from "./index";

/**
 * Adaptateur papier de `6gen54` — PROVISOIRE (lots B et C du 6e ch. 9 ; lot E à venir). Profil : aucun
 * cas particulier ; famille E : le nombre de droites est un VERDICT tiré dans chaque série (jamais
 * dans `forme`). Pas de `calcul` (règle du 24/11 : construire, établir une équation, ce n'est pas la
 * calculatrice qui le donne).
 */
export const adaptateurEvaluationPointsDroitesRemarquablesTriangle = construireAdaptateurLieux<ExercicePointsDroitesRemarquablesTriangle, PhasePointsDroitesRemarquablesTriangle>({
  titreDocument: "Constructions analytiques dans le triangle — Évaluation",
  nomFichierBase: "constructions-analytiques-triangle",
  genererInstance: genererExercicePointsDroitesRemarquablesTriangle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN54,
  phases: phasesPourExercice,
});
