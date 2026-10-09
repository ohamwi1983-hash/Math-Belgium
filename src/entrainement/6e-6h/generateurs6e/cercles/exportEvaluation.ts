import type { ExerciceCercles } from "../../core6e/cercles.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatCercles";
import { phasesPourExercice } from "../../moteur6e/typesCercles";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCercles } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCercles>` pour `6gen55` (Lieux géométriques — cercles) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Lieux géométriques ».
 */

function entete(exercice: ExerciceCercles) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceCercles): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceCercles): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationCercles: AdaptateurFeuilleExercices<ExerciceCercles> = {
  titreDocument: "Lieux géométriques — cercles — Évaluation",
  nomFichierBase: "lieux-cercles",
  genererInstance: genererExerciceCercles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
