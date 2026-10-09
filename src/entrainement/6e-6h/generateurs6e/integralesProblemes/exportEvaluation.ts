import type { ExerciceIntegralesProblemes } from "../../core6e/integralesProblemes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatIntegralesProblemes";
import { phasesPourExercice } from "../../moteur6e/typesIntegralesProblemes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntegralesProblemes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceIntegralesProblemes>` pour `6gen29` (Problèmes
 * d'intégrales — synthèse) — NOUVEAU, même principe que `calculPrimitives/exportEvaluation.ts`
 * (6gen23).
 */

function entete(exercice: ExerciceIntegralesProblemes) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceIntegralesProblemes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceIntegralesProblemes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationIntegralesProblemes: AdaptateurFeuilleExercices<ExerciceIntegralesProblemes> = {
  titreDocument: "Problèmes d'intégrales — Évaluation",
  nomFichierBase: "integrales-problemes",
  genererInstance: genererExerciceIntegralesProblemes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
