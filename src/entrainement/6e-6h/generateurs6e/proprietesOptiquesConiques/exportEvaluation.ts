import type { ExerciceProprietesOptiquesConiques } from "../../core6e/proprietesOptiquesConiques.types";
import type { PhaseProprietesOptiquesConiques } from "../../moteur6e/typesProprietesOptiquesConiques";
import { phasesPourExercice } from "../../moteur6e/typesProprietesOptiquesConiques";
import { FORMAT_6GEN63 } from "../../ui6e/formatProprietesOptiquesConiques";
import { construireAdaptateurConiques } from "../adaptateurConiques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesOptiquesConiques } from "./index";

/**
 * Adaptateur papier de `6gen63` — PROVISOIRE (lots B et C du 6e ch. 10 ; lot E à venir : processus 3,
 * figure du trajet au corrigé). Petits dénominateurs, parabole ajoutée (catalogue : ajouts EN FIN).
 * Aucun `calcul`.
 */
export const adaptateurEvaluationProprietesOptiquesConiques = construireAdaptateurConiques<ExerciceProprietesOptiquesConiques, PhaseProprietesOptiquesConiques>({
  titreDocument: "Propriétés optiques des coniques — Évaluation",
  nomFichierBase: "proprietes-optiques-coniques",
  genererInstance: genererExerciceProprietesOptiquesConiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN63,
  phases: phasesPourExercice,
});
