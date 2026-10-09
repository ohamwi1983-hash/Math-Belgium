import type { ExerciceCalculPrimitives } from "../../core6e/calculPrimitives.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatCalculPrimitives";
import { phasesPourExercice } from "../../moteur6e/typesCalculPrimitives";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCalculPrimitives } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCalculPrimitives>` pour `6gen23` (Calcul de
 * primitives) — NOUVEAU (aucun équivalent côté plateforme-maths, comme pour tout le chapitre
 * « Primitives et intégrales ») : une question imprimée par écran interactif traversé
 * (`phasesPourExercice`), réutilisant directement `consigneEcran`/`formatReponseAttenduePhaseLatex`.
 */

function entete(exercice: ExerciceCalculPrimitives) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceCalculPrimitives): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceCalculPrimitives): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationCalculPrimitives: AdaptateurFeuilleExercices<ExerciceCalculPrimitives> = {
  titreDocument: "Calcul de primitives — Évaluation",
  nomFichierBase: "calcul-primitives",
  genererInstance: genererExerciceCalculPrimitives,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
