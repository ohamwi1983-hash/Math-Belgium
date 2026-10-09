import type { ExerciceDenombrementCombine } from "../../core6e/denombrementCombine.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatDenombrementCombine";
import { phasesPourExercice } from "../../moteur6e/typesDenombrementCombine";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementCombine } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDenombrementCombine>` pour `6gen44` (Dénombrement
 * combiné et sélections contraintes) — NOUVEAU, même principe que `denombrementFondamental/
 * exportEvaluation.ts` (6gen43) : une question imprimée par écran interactif traversé
 * (`phasesPourExercice`), réutilisant directement `consigneEcran`/`formatReponseAttenduePhaseLatex`.
 */

function entete(exercice: ExerciceDenombrementCombine) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceDenombrementCombine): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceDenombrementCombine): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationDenombrementCombine: AdaptateurFeuilleExercices<ExerciceDenombrementCombine> = {
  titreDocument: "Dénombrement combiné et sélections contraintes — Évaluation",
  nomFichierBase: "denombrement-combine",
  genererInstance: genererExerciceDenombrementCombine,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
