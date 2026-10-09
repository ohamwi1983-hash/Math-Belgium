import type { ExerciceBinomialeSequenceOrdonnee } from "../../core6e/binomialeSequenceOrdonnee.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatBinomialeSequenceOrdonnee";
import { phasesPourExercice } from "../../moteur6e/typesBinomialeSequenceOrdonnee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBinomialeSequenceOrdonnee } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceBinomialeSequenceOrdonnee>` pour `6gen48`
 * (Probabilité binomiale et séquence exacte) — NOUVEAU, même principe que
 * `denombrementFondamental/exportEvaluation.ts` (6gen43).
 */

function entete(exercice: ExerciceBinomialeSequenceOrdonnee) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceBinomialeSequenceOrdonnee): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceBinomialeSequenceOrdonnee): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationBinomialeSequenceOrdonnee: AdaptateurFeuilleExercices<ExerciceBinomialeSequenceOrdonnee> = {
  titreDocument: "Probabilité binomiale et séquence exacte — Évaluation",
  nomFichierBase: "binomiale-sequence-ordonnee",
  genererInstance: genererExerciceBinomialeSequenceOrdonnee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
