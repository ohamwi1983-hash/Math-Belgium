/**
 * Profil d'instance de `6gen83` (« Contenance d'objets de révolution ») pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`AdaptateurFeuilleExercices.profilInstance`, `.claude/rules/feuilles-evaluations.md`).
 *
 * - `forme` = objet + question de transfert (« verre-hauteur », « vase-comparer »…) : même nombre
 *   et même type d'étapes d'une série à l'autre, nombres différents. L'objet est déjà fixé par la
 *   variante ; le transfert est tiré dans la variante (1/3 pour le verre, 1/2 ailleurs), donc
 *   toujours retrouvé (mesures dans le rapport de la refonte).
 * - Le verdict de la comparaison (quel objet contient le plus) n'est JAMAIS dans le profil : il
 *   reste tiré au hasard (50/50) dans chaque série.
 * - Pas de cas particulier (aucun raccourci naturel : chaque instance demande toutes les étapes).
 * - `calcul` : `'exacte'` quand la question de transfert se résout sans calculatrice — comparaison
 *   (π se simplifie entre deux multiples rationnels de π) ou hauteur pour une FRACTION de la
 *   contenance du verre (t = h·√(fraction)) — et que les nombres restent petits (pas le tonneau) ;
 *   `'calculatrice'` sinon (quantité donnée en cL ou en L : il faut une valeur approchée de π, une
 *   racine cubique, ou une division par 75 cL…). La contenance elle-même est toujours acceptée sous
 *   forme exacte (multiple de π).
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceContenanceObjets } from "../../core6e/contenanceObjets.types";

export function calculContenanceObjets(e: ExerciceContenanceObjets): "exacte" | "calculatrice" {
  const transfertExact = e.transfert === "comparer" || (e.transfert === "hauteur" && e.fraction !== null);
  return transfertExact && e.objet !== "tonneau" ? "exacte" : "calculatrice";
}

export function profilContenanceObjets(e: ExerciceContenanceObjets): ProfilInstance {
  return { casParticulier: null, forme: `${e.objet}-${e.transfert}`, calcul: calculContenanceObjets(e) };
}
