import type { ExerciceCalculAires } from "../../core6e/calculAires.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatCalculAires";
import { phasesPourExercice } from "../../moteur6e/typesCalculAires";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCalculAires } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCalculAires>` pour `6gen26` (Calcul d'aires par
 * intégrale) — NOUVEAU, même principe que `calculPrimitives/exportEvaluation.ts` (6gen23).
 */

function entete(exercice: ExerciceCalculAires) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceCalculAires): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceCalculAires): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationCalculAires: AdaptateurFeuilleExercices<ExerciceCalculAires> = {
  titreDocument: "Calcul d'aires par intégrale — Évaluation",
  nomFichierBase: "calcul-aires",
  genererInstance: genererExerciceCalculAires,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
