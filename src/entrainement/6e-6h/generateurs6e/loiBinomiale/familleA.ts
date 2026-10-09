import type { ContexteLoiBinomialeA, ExerciceLoiBinomialeA } from "../../core6e/loiBinomiale.types";
import { tirerParmi } from "./aleatoire";
import { CONTEXTES_A } from "./contextes";

/**
 * Couche A (6e) — génération famille A ("Justifier qu'une variable suit une loi binomiale") pour
 * `6gen50`. `n`/`p` restent à IDENTIFIER par l'élève (contrairement à `6gen48`) — voir en-tête
 * `core6e/loiBinomiale.types.ts`.
 */

export const CANDIDATS_N_A: readonly number[] = [5, 6, 7, 8, 9, 10, 11, 12];
/** Pourcentages "ronds", lisibles dans une phrase française une fois formatés
 * (`contextes.ts::formatPourcentageMot`). */
export const CANDIDATS_P_A: readonly number[] = [0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9];

/** Construction déterministe (`n`/`p` fixés) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. `contexte` optionnel (par défaut tiré au hasard). */
export function construireFamilleA(n: number, p: number, contexte?: ContexteLoiBinomialeA): ExerciceLoiBinomialeA {
  return { famille: "A", contexte: contexte ?? tirerParmi(CONTEXTES_A), n, p };
}

export function genererFamilleA(): ExerciceLoiBinomialeA {
  return construireFamilleA(tirerParmi(CANDIDATS_N_A), tirerParmi(CANDIDATS_P_A));
}
