import type { ExerciceDenombrementFondamental } from "../../core6e/denombrementFondamental.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatDenombrementFondamental";
import { phasesPourExercice } from "../../moteur6e/typesDenombrementFondamental";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementFondamental } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDenombrementFondamental>` pour `6gen43`
 * (Dénombrement fondamental et arrangements) — NOUVEAU (aucun équivalent côté plateforme-maths,
 * voir note de tâche : ce chapitre n'a jamais eu de fonctionnalité d'évaluation là-bas).
 *
 * Une question imprimée PAR ÉCRAN interactif traversé (`phasesPourExercice`, 1 à 3 selon la
 * famille/le sous-type tiré — jamais un nombre fixe), réutilisant directement `consigneEcran`
 * (texte déjà écrit pour l'écran) et `formatReponseAttenduePhaseLatex` (réponse CONFIRMÉE, jamais
 * recalculée) — aucune nouvelle formule, aucun nouveau texte : uniquement la mise en page papier
 * d'une séquence déjà entièrement spécifiée côté `ui6e/formatDenombrementFondamental.ts`.
 */

function enteteDenombrementFondamental(exercice: ExerciceDenombrementFondamental) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonceDenombrementFondamental(exercice: ExerciceDenombrementFondamental): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return {
    enteteFragments: enteteDenombrementFondamental(exercice),
    questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })),
  };
}

function construireCorrectionDenombrementFondamental(exercice: ExerciceDenombrementFondamental): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationDenombrementFondamental: AdaptateurFeuilleExercices<ExerciceDenombrementFondamental> = {
  titreDocument: "Dénombrement fondamental et arrangements — Évaluation",
  nomFichierBase: "denombrement-fondamental",
  genererInstance: genererExerciceDenombrementFondamental,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceDenombrementFondamental,
  construireCorrection: construireCorrectionDenombrementFondamental,
  // Nombre de questions VARIABLE selon la famille/le sous-type tiré (1 à 3 écrans, voir
  // `phasesPourExercice`) et consigne de chaque écran dépendante de la famille/du sous-type —
  // `regroupable` reste absent (ni consigne générique, ni nombre fixe de questions).
};
