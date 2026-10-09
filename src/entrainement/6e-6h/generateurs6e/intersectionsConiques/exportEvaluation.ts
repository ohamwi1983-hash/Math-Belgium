import type { ExerciceIntersectionsConiques } from "../../core6e/intersectionsConiques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatIntersectionsConiques";
import { phasesPourExercice } from "../../moteur6e/typesIntersectionsConiques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntersectionsConiques } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceIntersectionsConiques>` pour `6gen61` (Intersections de coniques) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Les coniques ».
 */

function entete(exercice: ExerciceIntersectionsConiques) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceIntersectionsConiques): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceIntersectionsConiques): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationIntersectionsConiques: AdaptateurFeuilleExercices<ExerciceIntersectionsConiques> = {
  titreDocument: "Intersections de coniques — Évaluation",
  nomFichierBase: "intersections-coniques",
  genererInstance: genererExerciceIntersectionsConiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
