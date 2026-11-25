import type { ExerciceLieuxGeometriquesParametres, PhaseLieuxGeometriquesParametres } from "../../core6e/lieuxGeometriquesParametres.types";
import { phasesPourExercice } from "../../moteur6e/typesLieuxGeometriquesParametres";
import { FORMAT_6GEN56 } from "../../ui6e/formatLieuxGeometriquesParametres";
import { construireAdaptateurLieux } from "../adaptateurLieux";
import { CATALOGUE_VARIANTES, GROUPES_VERDICT_6GEN56, construireAvecVarianteId, genererExerciceLieuxGeometriquesParametres } from "./index";

/**
 * Adaptateur papier de `6gen56` — PROVISOIRE (lots B et C du 6e ch. 9 ; lot E à venir). Les variantes
 * dont le NOM dit le régime (PA² + PB² = k « cercle », Apollonius « k = 1 », parallèles « vide »…)
 * forment des groupes à verdict (panneau d'évaluation) ; C et D tirent leur verdict dans la variante
 * (jamais dans `forme`). Aucun `calcul`, aucun cas particulier.
 */
export const adaptateurEvaluationLieuxGeometriquesParametres = construireAdaptateurLieux<ExerciceLieuxGeometriquesParametres, PhaseLieuxGeometriquesParametres>({
  titreDocument: "Lieux géométriques et élimination de paramètre — Évaluation",
  nomFichierBase: "lieux-geometriques",
  genererInstance: genererExerciceLieuxGeometriquesParametres,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN56,
  phases: phasesPourExercice,
  groupesVerdict: GROUPES_VERDICT_6GEN56,
});
