import type { ExerciceFormuleMoivre } from "../../core6e/formuleMoivre.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatFormuleMoivre";
import { phasesPourExercice } from "../../moteur6e/typesFormuleMoivre";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFormuleMoivre } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFormuleMoivre>` pour `6gen38` (Formule de Moivre) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Nombres complexes ».
 */

function entete(exercice: ExerciceFormuleMoivre) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceFormuleMoivre): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceFormuleMoivre): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationFormuleMoivre: AdaptateurFeuilleExercices<ExerciceFormuleMoivre> = {
  titreDocument: "Formule de Moivre — Évaluation",
  nomFichierBase: "formule-moivre",
  genererInstance: genererExerciceFormuleMoivre,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
