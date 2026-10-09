import type { ExerciceIdentificationConiques } from "../../core6e/identificationConiques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatIdentificationConiques";
import { phasesPourExercice } from "../../moteur6e/typesIdentificationConiques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIdentificationConiques } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceIdentificationConiques>` pour `6gen58` (Identification des coniques) — NOUVEAU,
 * même principe que les autres adaptateurs du chapitre « Les coniques ».
 */

function entete(exercice: ExerciceIdentificationConiques) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceIdentificationConiques): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceIdentificationConiques): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationIdentificationConiques: AdaptateurFeuilleExercices<ExerciceIdentificationConiques> = {
  titreDocument: "Identification des coniques — Évaluation",
  nomFichierBase: "identification-coniques",
  genererInstance: genererExerciceIdentificationConiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
