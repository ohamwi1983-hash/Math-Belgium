import type { ExerciceIntersectionsConiques } from "../../core6e/intersectionsConiques.types";
import type { PhaseIntersectionsConiques } from "../../moteur6e/typesIntersectionsConiques";
import { phasesPourExercice } from "../../moteur6e/typesIntersectionsConiques";
import { FORMAT_6GEN61 } from "../../ui6e/formatIntersectionsConiques";
import { construireAdaptateurConiques } from "../adaptateurConiques";
import { CATALOGUE_VARIANTES, GROUPES_VERDICT_6GEN61, construireAvecVarianteId, genererExerciceIntersectionsConiques } from "./index";

/**
 * Adaptateur papier de `6gen61` — PROVISOIRE (lots B et C du 6e ch. 10 ; lot E à venir). Le nombre de
 * points communs est un VERDICT : groupes à verdict ellipse et hyperbole (décision 3), jamais dans
 * `forme`. Aucun `calcul` ici (le lot E jugera les points seuls, donnés par l'application Équations).
 */
export const adaptateurEvaluationIntersectionsConiques = construireAdaptateurConiques<ExerciceIntersectionsConiques, PhaseIntersectionsConiques>({
  titreDocument: "Intersection d'une conique et d'une droite — Évaluation",
  nomFichierBase: "intersections-coniques",
  genererInstance: genererExerciceIntersectionsConiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN61,
  phases: phasesPourExercice,
  groupesVerdict: GROUPES_VERDICT_6GEN61,
});
