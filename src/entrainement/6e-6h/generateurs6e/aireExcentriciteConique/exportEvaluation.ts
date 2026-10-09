import type { ExerciceAireExcentriciteConique } from "../../core6e/aireExcentriciteConique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatAireExcentriciteConique";
import { phasesPourExercice } from "../../moteur6e/typesAireExcentriciteConique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAireExcentriciteConique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAireExcentriciteConique>` pour `6gen60` (Aire et excentricité d'une conique) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Les coniques ».
 */

function entete(exercice: ExerciceAireExcentriciteConique) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceAireExcentriciteConique): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceAireExcentriciteConique): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationAireExcentriciteConique: AdaptateurFeuilleExercices<ExerciceAireExcentriciteConique> = {
  titreDocument: "Aire et excentricité d'une conique — Évaluation",
  nomFichierBase: "aire-excentricite-conique",
  genererInstance: genererExerciceAireExcentriciteConique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
