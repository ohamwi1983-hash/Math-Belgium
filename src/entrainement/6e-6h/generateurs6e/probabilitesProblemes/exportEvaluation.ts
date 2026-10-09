import type { ExerciceProbabilitesProblemes } from "../../core6e/probabilitesProblemes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatProbabilitesProblemes";
import { phasesPourExercice } from "../../moteur6e/typesProbabilitesProblemes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabilitesProblemes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProbabilitesProblemes>` pour `6gen33` (Problèmes de probabilités) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Les probabilités ».
 */

function entete(exercice: ExerciceProbabilitesProblemes) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceProbabilitesProblemes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceProbabilitesProblemes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationProbabilitesProblemes: AdaptateurFeuilleExercices<ExerciceProbabilitesProblemes> = {
  titreDocument: "Problèmes de probabilités — Évaluation",
  nomFichierBase: "probabilites-problemes",
  genererInstance: genererExerciceProbabilitesProblemes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
