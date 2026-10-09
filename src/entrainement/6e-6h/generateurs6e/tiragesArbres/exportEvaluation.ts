import type { ExerciceTiragesArbres } from "../../core6e/tiragesArbres.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatTiragesArbres";
import { phasesPourExercice } from "../../moteur6e/typesTiragesArbres";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTiragesArbres } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTiragesArbres>` pour `6gen31` (Tirages et arbres de probabilité) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Les probabilités ».
 */

function entete(exercice: ExerciceTiragesArbres) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceTiragesArbres): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceTiragesArbres): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationTiragesArbres: AdaptateurFeuilleExercices<ExerciceTiragesArbres> = {
  titreDocument: "Tirages et arbres de probabilité — Évaluation",
  nomFichierBase: "tirages-arbres",
  genererInstance: genererExerciceTiragesArbres,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
