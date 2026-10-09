import type { ExerciceTransformationsPlan } from "../../core6e/transformationsPlan.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatTransformationsPlan";
import { phasesPourExercice } from "../../moteur6e/typesTransformationsPlan";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTransformationsPlan } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTransformationsPlan>` pour `6gen40` (Transformations du plan complexe) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Nombres complexes ».
 */

function entete(exercice: ExerciceTransformationsPlan) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceTransformationsPlan): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceTransformationsPlan): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationTransformationsPlan: AdaptateurFeuilleExercices<ExerciceTransformationsPlan> = {
  titreDocument: "Transformations du plan complexe — Évaluation",
  nomFichierBase: "transformations-plan",
  genererInstance: genererExerciceTransformationsPlan,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
