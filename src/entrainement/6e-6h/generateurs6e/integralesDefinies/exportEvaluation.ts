import type { ExerciceIntegralesDefinies } from "../../core6e/integralesDefinies.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatIntegralesDefinies";
import { phasesPourExercice } from "../../moteur6e/typesIntegralesDefinies";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntegralesDefinies } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceIntegralesDefinies>` pour `6gen25` (Intégrales
 * définies) — NOUVEAU, même principe que `calculPrimitives/exportEvaluation.ts` (6gen23).
 */

function entete(exercice: ExerciceIntegralesDefinies) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceIntegralesDefinies): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceIntegralesDefinies): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationIntegralesDefinies: AdaptateurFeuilleExercices<ExerciceIntegralesDefinies> = {
  titreDocument: "Intégrales définies — Évaluation",
  nomFichierBase: "integrales-definies",
  genererInstance: genererExerciceIntegralesDefinies,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
