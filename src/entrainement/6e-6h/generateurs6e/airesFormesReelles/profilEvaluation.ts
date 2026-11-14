/**
 * Profil d'instance de `6gen81` (« Aires de formes réelles ») pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`AdaptateurFeuilleExercices.profilInstance`, `.claude/rules/feuilles-evaluations.md`).
 *
 * - Aucun cas particulier : chaque instance est un problème COMPLET (modéliser, intégrer, répondre
 *   dans le contexte) ; aucune situation ne raccourcit naturellement la résolution.
 * - `forme` = situation + « fonction donnée / à retrouver » (+ contexte de la section : canal,
 *   tunnel ou gouttière, qui change le piège — aire sous l'axe, conversion en litres). La série A
 *   fixe la forme de chaque question, les autres séries la reproduisent avec d'autres nombres.
 * - `calcul` : `exacte` (cotes entières, réponses faisables à la main) / `calculatrice` (cotes
 *   décimales, intersections irrationnelles) — environ une instance sur deux de chaque régime dans
 *   chaque variante (mesures dans le rapport du commit).
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceAiresFormesReelles } from "../../core6e/airesFormesReelles.types";

export function formeAiresFormesReelles(e: ExerciceAiresFormesReelles): string {
  return e.situation === "section" ? `section:${e.modele}:${e.contexte}` : `${e.situation}:${e.modele}`;
}

export function profilAiresFormesReelles(e: ExerciceAiresFormesReelles): ProfilInstance {
  return { casParticulier: null, calcul: e.calcul, forme: formeAiresFormesReelles(e) };
}
