import type { ExerciceFormeTrigonometrique } from "../../core6e/formeTrigonometrique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatFormeTrigonometrique";
import { phasesPourExercice } from "../../moteur6e/typesFormeTrigonometrique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFormeTrigonometrique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFormeTrigonometrique>` pour `6gen37` (Forme trigonométrique) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Nombres complexes ».
 */

function entete(exercice: ExerciceFormeTrigonometrique) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceFormeTrigonometrique): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceFormeTrigonometrique): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationFormeTrigonometrique: AdaptateurFeuilleExercices<ExerciceFormeTrigonometrique> = {
  titreDocument: "Forme trigonométrique — Évaluation",
  nomFichierBase: "forme-trigonometrique",
  genererInstance: genererExerciceFormeTrigonometrique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
