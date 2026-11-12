/**
 * Profil d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * de 6gen74 (« Arbre, tableau, effectifs ») — méthode `.claude/rules/feuilles-evaluations.md`,
 * section « Tirage équilibré ».
 *
 * Décisions :
 * - Cas particulier « independance » (décision M de l'audit 6e ch. 6) : P(B|A) = P(B|Ā), donc
 *   P(B|A) = P(B) — l'arbre a deux branches égales au 2e niveau, ce qui RACCOURCIT l'écran
 *   « indépendance » (les deux pourcentages ou branches égaux se voient sans calcul). Par défaut,
 *   une évaluation tire donc des événements dépendants ; la case du panneau ajoute, en dernière
 *   question de la ligne, une situation d'indépendance exacte.
 * - `forme` = le sens de départ (pourcentages, arbre partiel, tableau partiel) : la série B
 *   reproduit la structure de la série A.
 * - `calcul` absent : toutes les valeurs sont exactes (effectifs entiers, branches multiples de
 *   0,05, P(A|B) en fraction) ; aucune instance n'exige la calculatrice (convention de
 *   `profilsEvaluationComplexes34-36.ts`).
 *
 * Mesure (10 000 tirages libres, lot 6gen74) : 15 % de cas « independance », sens de départ
 * équiprobables.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceArbreTableauEffectifs } from "../core6e/arbreTableauEffectifs.types";


export function profilArbreTableauEffectifs(e: ExerciceArbreTableauEffectifs): ProfilInstance {
  // Un verdict (indépendants ou non) n'est jamais un cas particulier : sinon la réponse de
  // l'étape 4 deviendrait prévisible dans une évaluation par défaut.
  return { casParticulier: null, forme: e.mode };
}
