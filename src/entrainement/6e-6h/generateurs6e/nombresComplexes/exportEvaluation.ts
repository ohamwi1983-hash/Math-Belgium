import type { ExerciceNombresComplexes } from "../../core6e/nombresComplexes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatNombresComplexes";
import { phasesPourExercice } from "../../moteur6e/typesNombresComplexes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceNombresComplexes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceNombresComplexes>` pour `6gen34` (Nombres complexes — opérations de base) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Nombres complexes ».
 */

function entete(exercice: ExerciceNombresComplexes) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceNombresComplexes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceNombresComplexes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationNombresComplexes: AdaptateurFeuilleExercices<ExerciceNombresComplexes> = {
  titreDocument: "Nombres complexes — opérations de base — Évaluation",
  nomFichierBase: "nombres-complexes-base",
  genererInstance: genererExerciceNombresComplexes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
