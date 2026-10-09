import type { ExerciceLoiPoisson } from "../../core6e/loiPoisson.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatLoiPoisson";
import { phasesPourExercice } from "../../moteur6e/typesLoiPoisson";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiPoisson } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLoiPoisson>` pour `6gen53` (Loi de Poisson) —
 * NOUVEAU, même principe que `variablesDiscretesEsperance/exportEvaluation.ts` (6gen49).
 */

function entete(exercice: ExerciceLoiPoisson) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceLoiPoisson): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceLoiPoisson): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationLoiPoisson: AdaptateurFeuilleExercices<ExerciceLoiPoisson> = {
  titreDocument: "Loi de Poisson — Évaluation",
  nomFichierBase: "loi-poisson",
  genererInstance: genererExerciceLoiPoisson,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
