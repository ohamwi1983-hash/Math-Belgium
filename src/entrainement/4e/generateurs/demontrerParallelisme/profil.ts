import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDemontrerParallelisme } from "../../core/demontrerParallelisme.types";

/**
 * Profil d'instance de gen103 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = la variante seule (droite parallèle à un plan / deux plans parallèles / trois points
 *   alignés) : elle fixe le nombre d'étapes (critère + témoin + 1 justification, ou critère + 2
 *   parallélismes + 2 justifications, ou idée + points communs + conclusion). Ce que l'élève doit
 *   DÉCIDER — le critère, la ou les droites témoins, le type de justification (côtés opposés d'un
 *   parallélogramme, droite des milieux, milieux de deux côtés opposés) — n'entre JAMAIS dans
 *   `forme` : il reste tiré au hasard dans chaque série (décision de l'utilisateur). Variété mesurée
 *   (rapport du générateur) : des centaines d'énoncés distincts par variante, donc deux séries n'ont
 *   presque jamais le même exercice.
 * - Cas particulier : `toit` (variante « trois points alignés », manuel ex. 11 b) — un côté du
 *   triangle MNP est parallèle au côté correspondant de la base, l'énoncé le DIT (ce n'est pas un
 *   verdict) et la question change (« (IJ) ∥ (AC) » au lieu de « alignés »). Par défaut, une
 *   évaluation ne tire donc que le cas général ; la case de la rangée « Trois points alignés » ajoute
 *   le cas toit, le même dans toutes les séries. Les deux autres variantes n'ont aucun cas
 *   particulier. Pas de `calcul` : aucun calcul numérique dans ce chapitre.
 */
export const CAS_TOIT_GEN103 = "toit";

export const LIBELLE_CAS_GEN103 = "Inclure un cas particulier : un côté du triangle MNP parallèle à la base (théorème du toit)";

export function profilDemontrerParallelisme(e: ExerciceDemontrerParallelisme): ProfilInstance {
  return { casParticulier: e.variante === "alignes" && e.cas === "toit" ? CAS_TOIT_GEN103 : null, forme: e.variante };
}
