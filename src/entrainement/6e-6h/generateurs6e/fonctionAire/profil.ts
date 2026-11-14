import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceFonctionAire } from "../../core6e/fonctionAire.types";
import { extremumsA, pointsTableau, zerosChangementSigne, zerosInterieurs } from "../../moteur6e/modeleFonctionAire";
import { phasesPourExercice } from "../../moteur6e/typesFonctionAire";
import { valeursExactesAttendues } from "../../moteur6e/verificationFonctionAire";

/**
 * Profil de tirage équilibré de `6gen78` « La fonction aire » (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance est complète (toutes les étapes à faire).
 * - `forme` = signature de difficulté, identique d'une série à l'autre, question par question :
 *   la variante, le nombre de changements de signe de f (1 ou 2 : nombre d'extremums de A, de
 *   lobes à compter), puis, quand on CALCULE des valeurs de A : `pi` si une valeur demandée fait
 *   intervenir un demi-disque, `ai` si une valeur est demandée à GAUCHE de a (intégrale aux bornes
 *   inversées) ; pour `variations` et `extremums`, `contact` si f a un zéro SANS changement de
 *   signe (une ligne piège de plus). Exemple : « extremums-2ch-pi-contact ». Seuls les nombres et
 *   la courbe changent entre les séries.
 * - La position du bon graphique (variante `graphique`) reste tirée au hasard dans chaque série.
 * - `calcul` absent : tout est exact (triangles, trapèzes, demi-disques), sans calculatrice.
 */

/** Abscisses où une valeur de A est demandée (hors A(a)). */
function abscissesDemandees(e: ExerciceFonctionAire): number[] {
  switch (e.variante) {
    case "valeurs":
      return e.points;
    case "variations":
      return pointsTableau(e);
    case "extremums":
      return extremumsA(e).map((m) => m.x);
    case "pente":
      return [e.points[0]];
    case "graphique":
      return [];
  }
}

export function formeFonctionAire(e: ExerciceFonctionAire): string {
  const morceaux = [e.variante, `${zerosChangementSigne(e).length}ch`];
  const valeurs = phasesPourExercice(e).flatMap((phase) => valeursExactesAttendues(e, phase));
  if (valeurs.some((v) => v.quartPi !== 0)) morceaux.push("pi");
  if (abscissesDemandees(e).some((x) => x < e.a)) morceaux.push("ai");
  if ((e.variante === "variations" || e.variante === "extremums") && zerosInterieurs(e).some((z) => !z.changeSigne)) morceaux.push("contact");
  return morceaux.join("-");
}

export function profilFonctionAire(e: ExerciceFonctionAire): ProfilInstance {
  return { casParticulier: null, forme: formeFonctionAire(e) };
}
