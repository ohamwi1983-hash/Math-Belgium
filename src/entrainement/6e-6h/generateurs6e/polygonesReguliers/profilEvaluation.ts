/**
 * Profil d'instance de `6gen97` « Polygones réguliers et racines n-ièmes » pour le TIRAGE ÉQUILIBRÉ
 * des évaluations (`.claude/rules/feuilles-evaluations.md`).
 *
 * - `forme` = la variante + le nombre n de sommets pour `sommets` (n change la nature du calcul :
 *   √3 pour n = 3 ou 6, √2 pour n = 8, entiers seulement pour n = 4, et le nombre de sommets
 *   demandés) ; la variante seule pour `mesures` et `somme-nulle` (mêmes étapes quel que soit n).
 *   Pour `mesures`, figer n laissait trop peu de résultats différents (les réponses ne dépendent que
 *   de n et de |z₀|²) : deux séries sur trois avaient les mêmes réponses dans un plan réel ; n libre
 *   et |z₀|² équiprobable donnent 96 jeux de réponses. Les séries B, C… reprennent donc la même
 *   variante (et le même n pour `sommets`) avec d'autres nombres. Rien à décider dans ce
 *   générateur (les choix fermés portent sur une relation ou une justification, toujours la même) :
 *   aucun verdict à protéger. Fréquences (tirage par variante) : 1/4 environ par n pour `sommets`
 *   (dont 1/6 avec le centre en O), 1 pour les deux autres.
 * - Cas particulier « centre-origine » (`sommets` seulement) : C = O, la rotation se fait autour de
 *   l'origine — pas de translation, la résolution est plus courte. Tiré 1 fois sur 6 dans le
 *   générateur, avant la boucle de rejet.
 * - Pas de `calcul` : toutes les instances sont exactes (√2, √3, fractions, entiers).
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExercicePolygones } from "../../core6e/polygonesReguliers.types";
import { centreEnO } from "../../moteur6e/modelePolygonesReguliers";

export const LIBELLE_CAS_POLYGONES = "Inclure un cas particulier (polygone centré en O : rotation autour de l'origine, sans translation)";

export function profilPolygones(e: ExercicePolygones): ProfilInstance {
  if (e.variante === "sommets") return { casParticulier: centreEnO(e) ? "centre-origine" : null, forme: `sommets-n${e.n}` };
  return { casParticulier: null, forme: e.variante };
}
