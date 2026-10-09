import type { ExerciceRacinesNiemes } from "../../core6e/racinesNiemes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatRacinesNiemes";
import { phasesPourExercice } from "../../moteur6e/typesRacinesNiemes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRacinesNiemes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceRacinesNiemes>` pour `6gen39` (Racines n-ièmes) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Nombres complexes ».
 */

function entete(exercice: ExerciceRacinesNiemes) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceRacinesNiemes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceRacinesNiemes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationRacinesNiemes: AdaptateurFeuilleExercices<ExerciceRacinesNiemes> = {
  titreDocument: "Racines n-ièmes — Évaluation",
  nomFichierBase: "racines-niemes",
  genererInstance: genererExerciceRacinesNiemes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
