import type { ExerciceProprietesOptiquesConiques } from "../../core6e/proprietesOptiquesConiques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatProprietesOptiquesConiques";
import { TOUTES_LES_PHASES } from "../../moteur6e/typesProprietesOptiquesConiques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesOptiquesConiques } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProprietesOptiquesConiques>` pour `6gen63`
 * (Propriétés optiques des coniques) — NOUVEAU, même principe que les autres adaptateurs du
 * chapitre « Les coniques », sauf que ce générateur a TOUJOURS 4 écrans fixes (jamais de
 * branchement selon l'exercice) : `TOUTES_LES_PHASES` remplace `phasesPourExercice(exercice)`.
 */

function entete(exercice: ExerciceProprietesOptiquesConiques) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceProprietesOptiquesConiques): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    questions: TOUTES_LES_PHASES.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })),
  };
}

function construireCorrection(exercice: ExerciceProprietesOptiquesConiques): BlocCorrection[] {
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return TOUTES_LES_PHASES.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationProprietesOptiquesConiques: AdaptateurFeuilleExercices<ExerciceProprietesOptiquesConiques> = {
  titreDocument: "Propriétés optiques des coniques — Évaluation",
  nomFichierBase: "proprietes-optiques-coniques",
  genererInstance: genererExerciceProprietesOptiquesConiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
