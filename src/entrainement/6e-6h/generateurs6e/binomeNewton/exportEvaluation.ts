import type { ExerciceBinomeNewton } from "../../core6e/binomeNewton.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatBinomeNewton";
import { phasesPourExercice } from "../../moteur6e/typesBinomeNewton";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBinomeNewton } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceBinomeNewton>` pour `6gen45` (Binôme de Newton) —
 * NOUVEAU, même principe que `denombrementFondamental/exportEvaluation.ts` (6gen43).
 */

function entete(exercice: ExerciceBinomeNewton) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceBinomeNewton): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceBinomeNewton): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationBinomeNewton: AdaptateurFeuilleExercices<ExerciceBinomeNewton> = {
  titreDocument: "Binôme de Newton — Évaluation",
  nomFichierBase: "binome-newton",
  genererInstance: genererExerciceBinomeNewton,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
