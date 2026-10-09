import type { ExerciceIndependanceBayes } from "../../core6e/independanceBayes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatIndependanceBayes";
import { phasesPourExercice } from "../../moteur6e/typesIndependanceBayes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIndependanceBayes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceIndependanceBayes>` pour `6gen32` (Indépendance et formule de Bayes) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Les probabilités ».
 */

function entete(exercice: ExerciceIndependanceBayes) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceIndependanceBayes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceIndependanceBayes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationIndependanceBayes: AdaptateurFeuilleExercices<ExerciceIndependanceBayes> = {
  titreDocument: "Indépendance et formule de Bayes — Évaluation",
  nomFichierBase: "independance-bayes",
  genererInstance: genererExerciceIndependanceBayes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
