import type { ExerciceTangentesConique } from "../../core6e/tangentesConique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatTangentesConique";
import { phasesPourExercice } from "../../moteur6e/typesTangentesConique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangentesConique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTangentesConique>` pour `6gen62` (Tangentes à une conique) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Les coniques ».
 */

function entete(exercice: ExerciceTangentesConique) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceTangentesConique): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceTangentesConique): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationTangentesConique: AdaptateurFeuilleExercices<ExerciceTangentesConique> = {
  titreDocument: "Tangentes à une conique — Évaluation",
  nomFichierBase: "tangentes-conique",
  genererInstance: genererExerciceTangentesConique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
