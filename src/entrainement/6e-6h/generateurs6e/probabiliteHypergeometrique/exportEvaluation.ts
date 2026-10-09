import type { ExerciceProbabiliteHypergeometrique } from "../../core6e/probabiliteHypergeometrique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatProbabiliteHypergeometrique";
import { phasesPourExercice } from "../../moteur6e/typesProbabiliteHypergeometrique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabiliteHypergeometrique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProbabiliteHypergeometrique>` pour `6gen47`
 * (Probabilité hypergéométrique) — NOUVEAU, même principe que `denombrementFondamental/
 * exportEvaluation.ts` (6gen43).
 */

function entete(exercice: ExerciceProbabiliteHypergeometrique) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceProbabiliteHypergeometrique): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceProbabiliteHypergeometrique): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationProbabiliteHypergeometrique: AdaptateurFeuilleExercices<ExerciceProbabiliteHypergeometrique> = {
  titreDocument: "Probabilité hypergéométrique — Évaluation",
  nomFichierBase: "probabilite-hypergeometrique",
  genererInstance: genererExerciceProbabiliteHypergeometrique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
