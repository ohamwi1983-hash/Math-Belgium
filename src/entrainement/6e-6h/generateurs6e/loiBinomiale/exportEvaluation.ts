import type { ExerciceLoiBinomiale } from "../../core6e/loiBinomiale.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatLoiBinomiale";
import { phasesPourExercice } from "../../moteur6e/typesLoiBinomiale";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiBinomiale } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLoiBinomiale>` pour `6gen50` (Loi binomiale) —
 * NOUVEAU, même principe que `variablesDiscretesEsperance/exportEvaluation.ts` (6gen49).
 */

function entete(exercice: ExerciceLoiBinomiale) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceLoiBinomiale): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceLoiBinomiale): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationLoiBinomiale: AdaptateurFeuilleExercices<ExerciceLoiBinomiale> = {
  titreDocument: "Loi binomiale — Évaluation",
  nomFichierBase: "loi-binomiale",
  genererInstance: genererExerciceLoiBinomiale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
