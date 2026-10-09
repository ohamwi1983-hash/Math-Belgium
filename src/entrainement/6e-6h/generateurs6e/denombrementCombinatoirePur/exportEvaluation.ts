import type { ExerciceDenombrementCombinatoirePur } from "../../core6e/denombrementCombinatoirePur.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatDenombrementCombinatoirePur";
import { phasesPourExercice } from "../../moteur6e/typesDenombrementCombinatoirePur";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementCombinatoirePur } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDenombrementCombinatoirePur>` pour `6gen46`
 * (Dénombrement combinatoire pur : problèmes) — NOUVEAU, même principe que
 * `denombrementFondamental/exportEvaluation.ts` (6gen43).
 */

function entete(exercice: ExerciceDenombrementCombinatoirePur) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceDenombrementCombinatoirePur): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceDenombrementCombinatoirePur): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationDenombrementCombinatoirePur: AdaptateurFeuilleExercices<ExerciceDenombrementCombinatoirePur> = {
  titreDocument: "Dénombrement combinatoire pur : problèmes — Évaluation",
  nomFichierBase: "denombrement-combinatoire-pur",
  genererInstance: genererExerciceDenombrementCombinatoirePur,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
