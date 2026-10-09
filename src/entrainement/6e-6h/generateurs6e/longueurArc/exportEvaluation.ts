import type { ExerciceLongueurArc } from "../../core6e/longueurArc.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatLongueurArc";
import { phasesPourExercice } from "../../moteur6e/typesLongueurArc";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLongueurArc } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLongueurArc>` pour `6gen28` (Longueur d'un arc de
 * courbe) — NOUVEAU, même principe que `calculPrimitives/exportEvaluation.ts` (6gen23).
 */

function entete(exercice: ExerciceLongueurArc) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceLongueurArc): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceLongueurArc): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationLongueurArc: AdaptateurFeuilleExercices<ExerciceLongueurArc> = {
  titreDocument: "Longueur d'un arc de courbe — Évaluation",
  nomFichierBase: "longueur-arc",
  genererInstance: genererExerciceLongueurArc,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
