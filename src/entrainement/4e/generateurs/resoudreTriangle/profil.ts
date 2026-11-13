import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceResoudreTriangle } from "../../core/resoudreTriangle.types";
import { positionObtus } from "../../moteur/resolutionTriangle";

/**
 * Profil d'instance de gen73 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - La VARIANTE fixe la configuration (AAS, SAS, SSS, SSA), donc les lois et le nombre d'étapes.
 * - `forme` = configuration + position de l'angle obtus : « aucun » (tous les angles aigus),
 *   « donne » (l'angle obtus est une donnée : aucun risque d'arcsin) ou « calcule » (l'angle obtus
 *   est une inconnue — en SAS et SSS, c'est le piège central : il faut Al-Kashi, la loi des sinus
 *   donnerait l'angle aigu). Exemple : « SAS:calcule ». Mesures (5 000 tirages par variante) :
 *   AAS, SAS, SSA ≈ 60 % aucun / 20 % donne / 20 % calcule ; SSS ≈ 60 % aucun / 40 % calcule
 *   (l'angle obtus de SSS est toujours calculé). Forme la plus rare ≈ 20 % : ≈ 4 000
 *   correspondances attendues en 20 000 essais, aucune bride nécessaire.
 * - Pas de cas particulier : un triangle rectangle ou isocèle ne raccourcit pas la résolution
 *   enseignée (et le générateur évite les angles entre 85° et 100°).
 * - `calcul: 'calculatrice'` : toujours (arc cosinus, sinus d'angles quelconques).
 */
export function formeResoudreTriangle(e: ExerciceResoudreTriangle): string {
  return `${e.configuration}:${positionObtus(e.triangle, e.donnees)}`;
}

export function profilResoudreTriangle(e: ExerciceResoudreTriangle): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: formeResoudreTriangle(e) };
}
