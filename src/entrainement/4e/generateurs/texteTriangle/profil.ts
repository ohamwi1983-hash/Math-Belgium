import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceTexteTriangle } from "../../core/texteTriangle.types";

/**
 * Profil d'instance de gen77 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - La VARIANTE fixe déjà la situation (trajets, deux mobiles, élévation, dépression, distance
 *   inaccessible, parcelle, deux positions).
 * - `forme` = situation + loi utilisée + type de conversion d'angle, identique d'une série à l'autre,
 *   question par question : « trajets:cosinus:nord » (écart des caps à mesurer en passant par le
 *   nord), « distanceInaccessible:sinus:releve » (trois angles à déduire de relèvements, contre un
 *   seul par la somme des angles), « parcelle:aire:direct »… Pour « deux positions » : l'information
 *   qui tranche porte sur une distance ou sur un angle. Fréquence de chaque forme dans sa variante
 *   ≥ 20 % (mesure : rapport final) → largement retrouvable en 20 000 essais.
 * - Aucun cas particulier : rien ne raccourcit naturellement la résolution (pas d'angle droit, pas
 *   de valeur remarquable, toujours une conversion et une loi à appliquer), et l'existence des deux
 *   positions fait partie de la situation (ce n'est pas un verdict).
 * - `calcul: 'calculatrice'` toujours (sinus et cosinus d'angles quelconques) :
 *   `calculatriceIndispensable`.
 */
export function formeTexteTriangle(e: ExerciceTexteTriangle): string {
  if (e.variante === "deuxPositions") return `deuxPositions:sinus:${e.info.type.startsWith("angle") ? "angle" : "distance"}`;
  return `${e.variante}:${e.calcul.loi}:${e.sousType}`;
}

export function profilTexteTriangle(e: ExerciceTexteTriangle): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: formeTexteTriangle(e) };
}
