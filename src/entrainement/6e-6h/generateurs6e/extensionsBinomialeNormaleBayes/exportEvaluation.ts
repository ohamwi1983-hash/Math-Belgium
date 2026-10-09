import type { ExerciceExtensionsBinomialeNormaleBayes } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatExtensionsBinomialeNormaleBayes";
import { phasesPourExercice } from "../../moteur6e/typesExtensionsBinomialeNormaleBayes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceExtensionsBinomialeNormaleBayes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceExtensionsBinomialeNormaleBayes>` pour `6gen52`
 * (Extensions binomiale, normale et Bayes) — NOUVEAU, même principe que
 * `variablesDiscretesEsperance/exportEvaluation.ts` (6gen49).
 */

function entete(exercice: ExerciceExtensionsBinomialeNormaleBayes) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceExtensionsBinomialeNormaleBayes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceExtensionsBinomialeNormaleBayes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationExtensionsBinomialeNormaleBayes: AdaptateurFeuilleExercices<ExerciceExtensionsBinomialeNormaleBayes> = {
  titreDocument: "Extensions binomiale, normale et Bayes — Évaluation",
  nomFichierBase: "extensions-binomiale-normale-bayes",
  genererInstance: genererExerciceExtensionsBinomialeNormaleBayes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
