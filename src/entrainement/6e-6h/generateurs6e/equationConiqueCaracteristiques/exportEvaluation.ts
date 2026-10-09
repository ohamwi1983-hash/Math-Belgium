import type { ExerciceEquationConiqueCaracteristiques } from "../../core6e/equationConiqueCaracteristiques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatEquationConiqueCaracteristiques";
import { phasesPourExercice } from "../../moteur6e/typesEquationConiqueCaracteristiques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationConiqueCaracteristiques } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationConiqueCaracteristiques>` pour `6gen59` (Équation d'une conique et caractéristiques) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Les coniques ».
 */

function entete(exercice: ExerciceEquationConiqueCaracteristiques) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceEquationConiqueCaracteristiques): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceEquationConiqueCaracteristiques): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationEquationConiqueCaracteristiques: AdaptateurFeuilleExercices<ExerciceEquationConiqueCaracteristiques> = {
  titreDocument: "Équation d'une conique et caractéristiques — Évaluation",
  nomFichierBase: "equation-conique-caracteristiques",
  genererInstance: genererExerciceEquationConiqueCaracteristiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
