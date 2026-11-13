import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceTraverserRiviere } from "../../core/traverserRiviere.types";
import { instanceExacte } from "../../moteur/modeleTraverserRiviere";

/**
 * Profil d'instance de gen87 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - La VARIANTE fixe déjà la question (où accoste-t-il, avec une vitesse propre perpendiculaire ou
 *   oblique ; ou quelle direction pour arriver juste en face).
 * - `forme` = variante + situation (+ dernière question « vitesse réelle » ou « distance parcourue »
 *   pour l'accostage), ex. « accostage:oblique:kayak:distance », « enFace:nageur » : même contexte
 *   et même nombre d'étapes d'une série à l'autre, seuls les nombres changent.
 * - `calcul` : « exacte » quand la norme demandée est un décimal (triplet pythagoricien : tout se
 *   fait de tête), « calculatrice » quand c'est une racine irrationnelle (valeur arrondie demandée).
 *   Le générateur tire l'un ou l'autre une fois sur deux, quelle que soit la forme.
 * - Aucun cas particulier : la vitesse propre « perpendiculaire aux rives » est une variante à part
 *   entière (elle fait partie de la forme), et le cas impossible (vitesse propre ≤ courant) n'est
 *   jamais tiré.
 *
 * Mesure (10 000 tirages par variante) : « calculatrice » 49 à 51 % dans chaque variante ; la
 * combinaison (forme, calcul) la plus rare sort à 5,7 % (accostage, 16 combinaisons) ou 11,8 % (en
 * face, 8 combinaisons), soit plus de 1 000 correspondances attendues en 20 000 essais : aucune
 * bride nécessaire.
 */
export function formeTraverserRiviere(e: ExerciceTraverserRiviere): string {
  if (e.variante === "enFace") return `enFace:${e.situation}`;
  return `accostage:${e.perpendiculaire ? "perpendiculaire" : "oblique"}:${e.situation}:${e.quatrieme}`;
}

export function profilTraverserRiviere(e: ExerciceTraverserRiviere): ProfilInstance {
  return { casParticulier: null, calcul: instanceExacte(e) ? "exacte" : "calculatrice", forme: formeTraverserRiviere(e) };
}
