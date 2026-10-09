import type { ExerciceLieuxGeometriquesParametres } from "../../core6e/lieuxGeometriquesParametres.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatLieuxGeometriquesParametres";
import { phasesPourExercice } from "../../moteur6e/typesLieuxGeometriquesParametres";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLieuxGeometriquesParametres } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLieuxGeometriquesParametres>` pour `6gen56` (Lieux géométriques par élimination du paramètre) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Lieux géométriques ».
 */

function entete(exercice: ExerciceLieuxGeometriquesParametres) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceLieuxGeometriquesParametres): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceLieuxGeometriquesParametres): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationLieuxGeometriquesParametres: AdaptateurFeuilleExercices<ExerciceLieuxGeometriquesParametres> = {
  titreDocument: "Lieux géométriques par élimination du paramètre — Évaluation",
  nomFichierBase: "lieux-elimination-parametre",
  genererInstance: genererExerciceLieuxGeometriquesParametres,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
