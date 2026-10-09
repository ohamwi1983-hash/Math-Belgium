import type { ExerciceLoiNormale } from "../../core6e/loiNormale.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatLoiNormale";
import { phasesPourExercice } from "../../moteur6e/typesLoiNormale";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiNormale } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLoiNormale>` pour `6gen51` (Loi normale) —
 * NOUVEAU, même principe que `variablesDiscretesEsperance/exportEvaluation.ts` (6gen49).
 */

function entete(exercice: ExerciceLoiNormale) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceLoiNormale): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceLoiNormale): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationLoiNormale: AdaptateurFeuilleExercices<ExerciceLoiNormale> = {
  titreDocument: "Loi normale — Évaluation",
  nomFichierBase: "loi-normale",
  genererInstance: genererExerciceLoiNormale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
