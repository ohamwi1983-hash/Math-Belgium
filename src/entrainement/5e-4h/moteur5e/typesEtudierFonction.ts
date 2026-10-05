/**
 * Couche B (5e) — types + ordre des écrans pour 5gen31 ("Étudier une fonction"). N'importe jamais
 * rien de `src/generateurs5e/`.
 *
 * Pipeline FIXE en 8 écrans possibles (longueur variable UNIQUEMENT sur "domaine", jamais ailleurs
 * — contrairement à 5gen29/5gen24, ce générateur montre TOUJOURS le calcul de f' ET f'' quelle que
 * soit la famille, jamais conditionné par un `niveau`) :
 *   1. "domaine"         — UNIQUEMENT si le domaine est restreint (`possedeDomaineRestreint`,
 *      "rationnelleAO" toujours 1 AV, "rationnelleAvecCE" toujours 2 AV) ; sauté sinon (domaine=ℝ).
 *   2. "limites"          — TOUJOURS (chaque AV + chaque infini, voir `verificationEtudierFonction.ts`).
 *   3. "calculerFPrime"   — TOUJOURS (l'élève DÉRIVE lui-même f, contrairement à 5gen29 où f' est
 *      donnée — compétence de 5gen27, appliquée ici en synthèse).
 *   4. "tableauFPrime"    — TOUJOURS (racines déjà connues à la génération, pré-placées en en-tête —
 *      jamais résolues par l'élève, contrairement à 5gen29 : ce générateur teste la SYNTHÈSE, pas la
 *      résolution d'équation, déjà exercée par 5gen29).
 *   5. "calculerFSeconde" — TOUJOURS.
 *   6. "tableauFSeconde"  — TOUJOURS.
 *   7. "recap"            — TOUJOURS, PUREMENT présentationnel (aucune nouvelle question — voir
 *      `sessionEtudierFonction.ts::avancerRecap`, qui n'enregistre AUCUN score pour cet écran).
 *   8. "graphique"         — TOUJOURS, placement de points par tap (voir
 *      `components5e/PlacementPointsGraphique.tsx`), toujours dernier écran.
 */
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import { possedeDomaineRestreint } from "./verificationEtudierFonction";

export type EcranEtudierFonction = "domaine" | "limites" | "calculerFPrime" | "tableauFPrime" | "calculerFSeconde" | "tableauFSeconde" | "recap" | "graphique";

export function ordreEcransEtudierFonction(exercice: ExerciceEtudierFonction): EcranEtudierFonction[] {
  const ordre: EcranEtudierFonction[] = [];
  if (possedeDomaineRestreint(exercice)) ordre.push("domaine");
  ordre.push("limites", "calculerFPrime", "tableauFPrime", "calculerFSeconde", "tableauFSeconde", "recap", "graphique");
  return ordre;
}

export function ecranInitial(exercice: ExerciceEtudierFonction): EcranEtudierFonction {
  return ordreEcransEtudierFonction(exercice)[0];
}

export function ecranApres(exercice: ExerciceEtudierFonction, ecran: EcranEtudierFonction): EcranEtudierFonction | "termine" {
  const ordre = ordreEcransEtudierFonction(exercice);
  const index = ordre.indexOf(ecran);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceEtudierFonction {
  exercice: ExerciceEtudierFonction;
  /** Indexé par écran RÉELLEMENT traversé — jamais de clé "recap" (aucun score, voir tête de
   * fichier), 7 ou 8 clés selon `ordreEcransEtudierFonction`. */
  scores: Partial<Record<EcranEtudierFonction, number>>;
}

export interface EtatSessionEtudierFonction {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceEtudierFonction;
  exerciceCourant: ExerciceEtudierFonction;
  phase: EcranEtudierFonction;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranEtudierFonction, number>>;
  indexExercice: number;
  resultats: ResultatExerciceEtudierFonction[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
