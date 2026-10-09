import type { ExerciceDeterminerParametresLogarithme } from "../../core6e/determinerParametresLogarithme.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { PhaseDeterminerParametresLogarithme } from "../../moteur6e/typesDeterminerParametresLogarithme";
import {
  blocDonneesA,
  blocDonneesB,
  blocDonneesC,
  consigneEcranA,
  consigneEcranB,
  consigneEcranC,
  consigneGeneraleA,
  consigneGeneraleB,
  consigneGeneraleC,
  formatReponseAttenduePhaseLatex,
  LIBELLE_PHASE,
  PHASES_PAR_FAMILLE,
} from "../../ui6e/formatDeterminerParametresLogarithme";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDeterminerParametresLogarithme } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDeterminerParametresLogarithme>` pour `6gen18`
 * ("Déterminer des paramètres depuis des conditions graphiques") — feuille d'évaluation.
 *
 * Malgré son nom, ce générateur n'affiche AUCUN graphique côté écran (`App6gen18.tsx` ne monte
 * jamais de composant SVG/Mafs) : les "conditions" sont des données textuelles/LaTeX (asymptote
 * verticale, ordonnée à l'origine, point de passage, racines, extremum) posées via
 * `EtapeChampDeterminerParametres`/`EtapeDeuxChampsDeterminerParametres` — jamais lues sur un
 * dessin. Donc pas d'`enteteHtml` ici, contrairement à `transformationsGraphiques/exportEvaluation.ts`.
 *
 * Même patron que `exponentiellesProblemes/exportEvaluation.ts` (7 familles, 2 à 4 écrans guidés
 * par famille) : 3 familles STRUCTURELLEMENT DISJOINTES (A/B/C), chacune 2 (A) ou 3 (B, C) écrans
 * (`PHASES_PAR_FAMILLE`), condensées en autant de questions écrites — une question par écran
 * réellement traversé par la famille tirée. Le corrigé de chaque question lit la réponse déjà
 * établie via `formatReponseAttenduePhaseLatex` (couche `ui6e/formatDeterminerParametresLogarithme.ts`,
 * la MÊME fonction qui alimente déjà `ResultatPanelDeterminerParametresLogarithme.tsx`), jamais
 * recalculée indépendamment.
 *
 * `regroupable` volontairement ABSENT : chaque instance produit 2 ou 3 questions (jamais une
 * seule), et la consigne de chaque écran dépend de la famille tirée (pas une consigne générale
 * unique indépendante de l'instance) — les deux critères du mécanisme de regroupement (voir
 * `AdaptateurFeuilleExercices.regroupable`) sont donc déjà exclus, indépendamment du fait qu'il n'y
 * ait pas de graphique.
 */

function blocDonnees(exercice: ExerciceDeterminerParametresLogarithme): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
  }
}

function consigneGenerale(exercice: ExerciceDeterminerParametresLogarithme): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC(exercice);
  }
}

function consigneEcran(exercice: ExerciceDeterminerParametresLogarithme, phase: PhaseDeterminerParametresLogarithme): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
  }
}

function construireEnonceDeterminerParametresLogarithme(exercice: ExerciceDeterminerParametresLogarithme): SectionExercice {
  const phases = PHASES_PAR_FAMILLE[exercice.famille];
  const donnees = blocDonnees(exercice);
  return {
    enteteFragments: [texte(consigneGenerale(exercice)), ...(donnees.length > 0 ? [latex(donnees.join(",\\quad "))] : [])],
    questions: phases.map((phase) => ({
      consigne: [texte(`${LIBELLE_PHASE[phase]} — `), texte(consigneEcran(exercice, phase))],
      reponse: { type: "lignes" as const, nombre: 3 },
    })),
  };
}

function construireCorrectionDeterminerParametresLogarithme(exercice: ExerciceDeterminerParametresLogarithme): BlocCorrection[] {
  const phases = PHASES_PAR_FAMILLE[exercice.famille];
  return phases.map((phase) => ({
    type: "paragraphe",
    fragments: [texte(`${LIBELLE_PHASE[phase]} : `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))],
  }));
}

export const adaptateurEvaluationDeterminerParametresLogarithme: AdaptateurFeuilleExercices<ExerciceDeterminerParametresLogarithme> = {
  titreDocument: "Déterminer des paramètres depuis des conditions — Évaluation",
  nomFichierBase: "determiner-parametres-logarithme",
  genererInstance: genererExerciceDeterminerParametresLogarithme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceDeterminerParametresLogarithme,
  construireCorrection: construireCorrectionDeterminerParametresLogarithme,
};
