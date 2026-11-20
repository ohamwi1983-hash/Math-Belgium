import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveTrig } from "../../core5e/detectiveTrig.types";

/**
 * Profil d'instance de 5gen50 pour le TIRAGE ÉQUILIBRÉ des évaluations (même principe que 5gen49).
 * - La VARIANTE fixe l'exercice support (secteur, paramètres, équation, produit nul).
 * - La LIGNE FAUSSE et le TYPE D'ERREUR sont les verdicts des étapes a) et b) : tirés au hasard dans
 *   chaque série, jamais dans `forme` (sinon la série B aurait la même erreur à la même ligne).
 * - `forme` = la variante seule (même support, même nombre de lignes, même démarche).
 * - Aucun cas particulier (chaque copie demande la même démarche) ; toutes les valeurs sont exactes
 *   mais la calculatrice n'y change rien : pas de `calcul` (le générateur reste tirable que la
 *   calculatrice soit interdite ou autorisée, comme 5gen49 hors pourcentages).
 */
export function profilDetectiveTrig(e: ExerciceDetectiveTrig): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
