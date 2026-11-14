/**
 * Profil d'instance de `6gen90` « Échelles logarithmiques : rapports et sommes » pour le TIRAGE
 * ÉQUILIBRÉ des évaluations (`.claude/rules/feuilles-evaluations.md`).
 *
 * - Aucun cas particulier : chaque instance est un problème COMPLET (traduire, calculer, répondre
 *   en contexte) ; aucune variante ne raccourcit la résolution.
 * - `forme` = contexte + type de question = l'identifiant de variante (db-sources, db-reduire,
 *   db-combien, db-comparer, seisme-amplitude, seisme-energie, seisme-magnitude, ph-comparer,
 *   ph-diluer, etoiles-eclat, etoiles-magnitude) : la série A fixe le contexte et le type de chaque
 *   question (facteur → écart, écart → rapport, écart visé → nombre de sources), les autres séries
 *   les reproduisent avec d'autres nombres. Probabilité 1/11 en tirage libre, × 0,4 (exacte) ou
 *   × 0,6 (calculatrice) : au moins ≈ 700 correspondances attendues en 20 000 essais, aucune bride.
 * - `calcul` : « exacte » quand le facteur est une puissance de 10 entière ou que le logarithme du
 *   rapport est entier (10, 100, 1 000… ; écart de magnitude pair pour les énergies ; écart multiple
 *   de 2,5 pour les étoiles), « calculatrice » sinon (log 2, 10^2,7…). Le régime est tiré avant les
 *   nombres (4 fois sur 10 exacte) ; CHAQUE variante a des instances des deux régimes, donc aucune
 *   n'est déclarée `calculatriceIndispensable`.
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceEchellesLogarithmiques } from "../../core6e/echellesLogarithmiques.types";

export function profilEchellesLogarithmiques(e: ExerciceEchellesLogarithmiques): ProfilInstance {
  return { casParticulier: null, calcul: e.regime, forme: e.variante };
}
