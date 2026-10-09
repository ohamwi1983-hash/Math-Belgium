import type { ExerciceProbabilitesEnsembles } from "../../core6e/probabilitesEnsembles.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatProbabilitesEnsembles";
import { phasesPourExercice } from "../../moteur6e/typesProbabilitesEnsembles";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabilitesEnsembles } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProbabilitesEnsembles>` pour `6gen30` (Probabilités et ensembles) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Les probabilités ».
 */

function entete(exercice: ExerciceProbabilitesEnsembles) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceProbabilitesEnsembles): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceProbabilitesEnsembles): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationProbabilitesEnsembles: AdaptateurFeuilleExercices<ExerciceProbabilitesEnsembles> = {
  titreDocument: "Probabilités et ensembles — Évaluation",
  nomFichierBase: "probabilites-ensembles",
  genererInstance: genererExerciceProbabilitesEnsembles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
