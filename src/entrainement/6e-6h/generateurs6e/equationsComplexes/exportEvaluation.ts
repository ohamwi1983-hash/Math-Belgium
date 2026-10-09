import type { ExerciceEquationsComplexes } from "../../core6e/equationsComplexes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatEquationsComplexes";
import { phasesPourExercice } from "../../moteur6e/typesEquationsComplexes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationsComplexes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationsComplexes>` pour `6gen36` (Équations dans C) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Nombres complexes ».
 */

function entete(exercice: ExerciceEquationsComplexes) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceEquationsComplexes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceEquationsComplexes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationEquationsComplexes: AdaptateurFeuilleExercices<ExerciceEquationsComplexes> = {
  titreDocument: "Équations dans C — Évaluation",
  nomFichierBase: "equations-complexes",
  genererInstance: genererExerciceEquationsComplexes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
