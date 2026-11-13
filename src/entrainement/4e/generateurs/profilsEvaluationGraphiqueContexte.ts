import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceGraphiqueContexte } from "../core/graphiqueContexte.types";

/**
 * gen70 — Lire un graphique en contexte : profil pour le tirage équilibré des évaluations.
 *
 * Pas de cas particulier : chaque instance pose 4 vraies questions de lecture, aucune ne se règle
 * en une ligne. La STRUCTURE est imposée identique d'une série à l'autre (`forme`) : même situation
 * et mêmes types de questions, dans le même ordre — les autres séries ne changent que les nombres
 * (forme de la courbe, niveaux lus, comparaisons « au moins / plus de… », sens de variation).
 * Mesure (2 000 tirages par situation) : 120 formes par situation « par points » (5 types, dont 4
 * tirés, × 4! ordres), 96 pour le café et les bouquetins (tendance toujours présente).
 */
export function profilGraphiqueContexte(e: ExerciceGraphiqueContexte): ProfilInstance {
  return { casParticulier: null, forme: `${e.contexte}|${e.questions.map((q) => q.type).join(",")}` };
}
