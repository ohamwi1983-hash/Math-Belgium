import type { ExerciceComplexesAvances } from "../../core6e/complexesAvances.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatComplexesAvances";
import { phasesPourExercice } from "../../moteur6e/typesComplexesAvances";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComplexesAvances } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComplexesAvances>` pour `6gen42` (Problèmes avancés sur les complexes) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Nombres complexes ».
 */

function entete(exercice: ExerciceComplexesAvances) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceComplexesAvances): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceComplexesAvances): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationComplexesAvances: AdaptateurFeuilleExercices<ExerciceComplexesAvances> = {
  titreDocument: "Problèmes avancés sur les complexes — Évaluation",
  nomFichierBase: "complexes-avances",
  genererInstance: genererExerciceComplexesAvances,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
