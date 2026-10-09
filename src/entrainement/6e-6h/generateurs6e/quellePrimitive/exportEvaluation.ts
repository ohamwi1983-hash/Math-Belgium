import type { ExerciceQuellePrimitive } from "../../core6e/quellePrimitive.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  blocDonneesQuellePrimitive,
  consigneEcranQuellePrimitive,
  consigneGeneraleQuellePrimitive,
  formatReponseAttenduePhaseLatexQuellePrimitive,
} from "../../ui6e/formatQuellePrimitive";
import { phasesPourExercice } from "../../moteur6e/typesQuellePrimitive";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, construireQuellePrimitive } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceQuellePrimitive>` pour `6gen24` (Trouver la
 * primitive vérifiant une condition initiale) — NOUVEAU, même principe que
 * `calculPrimitives/exportEvaluation.ts` (6gen23).
 */

function entete(exercice: ExerciceQuellePrimitive) {
  return [texte(`${consigneGeneraleQuellePrimitive()} Données : `), latex(blocDonneesQuellePrimitive(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceQuellePrimitive): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return {
    enteteFragments: entete(exercice),
    questions: phases.map((phase) => ({ consigne: [texte(consigneEcranQuellePrimitive(exercice, phase))] })),
  };
}

function construireCorrection(exercice: ExerciceQuellePrimitive): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatexQuellePrimitive(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationQuellePrimitive: AdaptateurFeuilleExercices<ExerciceQuellePrimitive> = {
  titreDocument: "Trouver la primitive (condition initiale) — Évaluation",
  nomFichierBase: "quelle-primitive",
  genererInstance: construireQuellePrimitive,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
