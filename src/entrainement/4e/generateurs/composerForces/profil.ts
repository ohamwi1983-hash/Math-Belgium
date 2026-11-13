import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceComposerForces } from "../../core/composerForces.types";

/**
 * Profil d'instance de gen80 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = situation + question + angle aigu ou obtus (θ entre les vecteurs, ou β entre le
 *   courant / le vent et la route pour le cap), ex. « remorqueurs:direction:obtus ». La question est
 *   déjà fixée par la variante ; la situation et l'angle sont tirés au hasard : les imposer d'une série
 *   à l'autre garde le même contexte et la même difficulté (un angle obtus rend 180° − θ aigu, un angle
 *   aigu le rend obtus — cos négatif dans Al-Kashi), seuls les nombres changent.
 *   Mesure (5 000 tirages par variante) : chaque forme sort avec une fréquence d'environ 1/8 (sens
 *   direct, 4 situations × 2) ou 1/4 (cap, 2 situations × 2) — des milliers de correspondances
 *   attendues en 20 000 essais, aucune bride nécessaire.
 * - Aucun cas particulier : les vecteurs perpendiculaires (Pythagore suffit) ne sont jamais tirés,
 *   et rien d'autre ne raccourcit la résolution.
 * - `calcul: 'calculatrice'` : cosinus et sinus d'angles quelconques, toujours la calculatrice
 *   (`calculatriceIndispensable` dans l'adaptateur).
 */
export function formeComposerForces(e: ExerciceComposerForces): string {
  return `${e.situation}:${e.question}:${e.angle > 90 ? "obtus" : "aigu"}`;
}

export function profilComposerForces(e: ExerciceComposerForces): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: formeComposerForces(e) };
}
