import type { ExerciceAireExcentriciteConique } from "../../core6e/aireExcentriciteConique.types";
import type { PhaseAireExcentriciteConique } from "../../moteur6e/typesAireExcentriciteConique";
import { phasesPourExercice } from "../../moteur6e/typesAireExcentriciteConique";
import { FORMAT_6GEN60 } from "../../ui6e/formatAireExcentriciteConique";
import { construireAdaptateurConiques } from "../adaptateurConiques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAireExcentriciteConique } from "./index";

/**
 * Adaptateur papier de `6gen60` — PROVISOIRE (lots B et C du 6e ch. 10 ; lot E à venir : processus 3,
 * profils « angle droit » et « k carré parfait »). Énoncés tirés (plus de 6 énoncés identiques dans un
 * plan, audit P5), valeurs exactes. Aucun `calcul`.
 */
export const adaptateurEvaluationAireExcentriciteConique = construireAdaptateurConiques<ExerciceAireExcentriciteConique, PhaseAireExcentriciteConique>({
  titreDocument: "Aire, rayons focaux et excentricité — Évaluation",
  nomFichierBase: "aire-excentricite-conique",
  genererInstance: genererExerciceAireExcentriciteConique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN60,
  phases: phasesPourExercice,
});
