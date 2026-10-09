import type { ExerciceAffixesRacines } from "../../core6e/affixesRacines.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatAffixesRacines";
import { phasesPourExercice } from "../../moteur6e/typesAffixesRacines";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAffixesRacines } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAffixesRacines>` pour `6gen35` (Affixes et racines de polynômes) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Nombres complexes ».
 */

function entete(exercice: ExerciceAffixesRacines) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceAffixesRacines): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceAffixesRacines): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationAffixesRacines: AdaptateurFeuilleExercices<ExerciceAffixesRacines> = {
  titreDocument: "Affixes et racines de polynômes — Évaluation",
  nomFichierBase: "affixes-racines",
  genererInstance: genererExerciceAffixesRacines,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
