import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveStatistique } from "../../core/detectiveStatistique.types";

/**
 * Profil d'instance de gen112 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré », et fiche validée par l'utilisateur) — même
 * principe que 5gen49.
 *
 * - La VARIANTE fixe l'exercice support (moyenne pondérée, médiane et quartiles, variance et
 *   écart-type, effectifs cumulés, moyenne de deux groupes).
 * - La LIGNE FAUSSE et le TYPE D'ERREUR sont les verdicts des étapes a) et b) : tirés au hasard
 *   dans chaque série (équiprobables dans la variante, `index.ts`), JAMAIS dans `forme` — sinon la
 *   série B aurait la même erreur à la même ligne que la série A (réponse recopiable). Les
 *   contraintes sur les données sont communes à tous les types d'une variante : aucun détail des
 *   nombres ne trahit le verdict.
 * - `forme` = la variante seule (même support, même nombre de lignes de copie, même démarche).
 *   Probabilité 1 dans sa variante : 20 000 essais suffisent largement.
 * - Aucun cas particulier : chaque copie demande la même démarche (trouver, nommer, corriger).
 * - `calcul` : seulement « dispersion » (racine carrée, écart-type arrondi au centième :
 *   « calculatrice » pour TOUTES ses instances, quel que soit le type d'erreur ; la variante est
 *   déclarée dans `calculatriceIndispensable`). Les autres variantes sont toujours exactes
 *   (pourcentages, écarts et moyennes décimales courtes) : pas de `calcul`.
 */
export function profilDetectiveStatistique(e: ExerciceDetectiveStatistique): ProfilInstance {
  if (e.variante === "dispersion") return { casParticulier: null, forme: e.variante, calcul: "calculatrice" };
  return { casParticulier: null, forme: e.variante };
}
