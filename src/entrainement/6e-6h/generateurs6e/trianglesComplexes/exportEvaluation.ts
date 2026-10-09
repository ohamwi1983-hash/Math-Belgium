import type { ExerciceTrianglesComplexes } from "../../core6e/trianglesComplexes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatTrianglesComplexes";
import { phasesPourExercice } from "../../moteur6e/typesTrianglesComplexes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTrianglesComplexes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTrianglesComplexes>` pour `6gen41` (Triangles et nombres complexes) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Nombres complexes ».
 */

function entete(exercice: ExerciceTrianglesComplexes) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceTrianglesComplexes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceTrianglesComplexes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationTrianglesComplexes: AdaptateurFeuilleExercices<ExerciceTrianglesComplexes> = {
  titreDocument: "Triangles et nombres complexes — Évaluation",
  nomFichierBase: "triangles-complexes",
  genererInstance: genererExerciceTrianglesComplexes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
