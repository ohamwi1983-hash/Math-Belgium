import type { ExercicePointsDroitesRemarquablesTriangle } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatPointsDroitesRemarquablesTriangle";
import { phasesPourExercice } from "../../moteur6e/typesPointsDroitesRemarquablesTriangle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointsDroitesRemarquablesTriangle } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExercicePointsDroitesRemarquablesTriangle>` pour `6gen54` (Points et droites remarquables du triangle) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Lieux géométriques ».
 */

function entete(exercice: ExercicePointsDroitesRemarquablesTriangle) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExercicePointsDroitesRemarquablesTriangle): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExercicePointsDroitesRemarquablesTriangle): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationPointsDroitesRemarquablesTriangle: AdaptateurFeuilleExercices<ExercicePointsDroitesRemarquablesTriangle> = {
  titreDocument: "Points et droites remarquables du triangle — Évaluation",
  nomFichierBase: "points-droites-remarquables",
  genererInstance: genererExercicePointsDroitesRemarquablesTriangle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
