import type { ExerciceMethodeGeneratrices } from "../../core6e/methodeGeneratrices.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatMethodeGeneratrices";
import { phasesPourExercice } from "../../moteur6e/typesMethodeGeneratrices";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMethodeGeneratrices } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceMethodeGeneratrices>` pour `6gen57` (Lieux géométriques — méthode des génératrices) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Lieux géométriques ».
 */

function entete(exercice: ExerciceMethodeGeneratrices) {
  return [texte(`${consigneGenerale()} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceMethodeGeneratrices): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceMethodeGeneratrices): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationMethodeGeneratrices: AdaptateurFeuilleExercices<ExerciceMethodeGeneratrices> = {
  titreDocument: "Lieux géométriques — méthode des génératrices — Évaluation",
  nomFichierBase: "lieux-methode-generatrices",
  genererInstance: genererExerciceMethodeGeneratrices,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
