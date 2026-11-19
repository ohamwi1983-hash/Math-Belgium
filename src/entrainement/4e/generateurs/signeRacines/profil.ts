import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceSigneRacines } from "../../core/signeRacines.types";

/**
 * Profil d'instance de gen114 (tirage équilibré, `.claude/rules/feuilles-evaluations.md`).
 *
 * - `forme` = la variante (signes par P, Δ, S ; racine évidente puis produit).
 * - Le VERDICT (signes opposés, deux positives, deux négatives, aucune racine) est la réponse : tiré
 *   au hasard dans chaque série (équiprobable dans la variante), jamais dans `forme` ni comme cas
 *   particulier — même si « signes opposés » raccourcit la résolution (P < 0 suffit), c'est
 *   précisément ce qu'il faut DÉCIDER.
 * - Pas de `calcul` : coefficients entiers, P et S en fractions.
 */
export function profilSigneRacines(e: ExerciceSigneRacines): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
