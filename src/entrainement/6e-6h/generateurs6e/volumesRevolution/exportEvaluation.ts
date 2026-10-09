import type { ExerciceVolumesRevolution } from "../../core6e/volumesRevolution.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatVolumesRevolution";
import { phasesPourExercice } from "../../moteur6e/typesVolumesRevolution";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVolumesRevolution } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceVolumesRevolution>` pour `6gen27` (Volumes de
 * révolution) — NOUVEAU, même principe que `calculPrimitives/exportEvaluation.ts` (6gen23).
 */

function entete(exercice: ExerciceVolumesRevolution) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceVolumesRevolution): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceVolumesRevolution): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationVolumesRevolution: AdaptateurFeuilleExercices<ExerciceVolumesRevolution> = {
  titreDocument: "Volumes de révolution — Évaluation",
  nomFichierBase: "volumes-revolution",
  genererInstance: genererExerciceVolumesRevolution,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
