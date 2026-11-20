/**
 * Couche core — `5gen58` « Détective d'erreurs : fonctions et composées » (5e ch. 1, §§ 1–4,
 * processus 3 TRANSFÉRER). Même mécanique que 5gen50 / 6gen144 : un élève fictif a résolu un
 * exercice du chapitre en 3 ou 4 lignes numérotées ; UNE ligne est fausse et la suite en découle.
 * Trois écrans : la ligne fausse (choix fermé), l'erreur (4 descriptions, choix fermé), le résultat
 * corrigé (champ libre).
 *
 * VARIANTE = TYPE D'ERREUR (comme 6gen144) — le nom de la variante donne donc la réponse de l'écran 2 :
 * groupe à verdict `groupe_erreur` dès le départ. Types (erreurs signalées par le cours) :
 * - sens : sens de l'inégalité non inversé en divisant par un négatif (§ 1, √(c − kx)) ;
 * - strict : « ≥ » au lieu de « > » pour une racine au dénominateur (§ 1) ;
 * - union : réunion au lieu de l'intersection des conditions (§ 1, √(x − a) + √(b − x)) ;
 * - condition2 : condition 2 oubliée (C1) ou domaine lu sur la formule simplifiée (C2) (§ 3) ;
 * - ordre : f∘g et g∘f inversés (§ 2) ;
 * - portion : « n'existe pas » au lieu de « hors de la portion tracée » (§ 4).
 */

export type VarianteDetectiveFonctions = "sens" | "strict" | "union" | "condition2" | "ordre" | "portion";
export type ScenarioDetectiveFonctions = "S" | "T" | "U" | "C1" | "C2" | "O" | "P";

export interface ExerciceDetectiveFonctions {
  variante: VarianteDetectiveFonctions;
  scenario: ScenarioDetectiveFonctions;
  /** Paramètres entiers du scénario. */
  d: Record<string, number>;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (le `?code=` rouvre le même ordre). */
  options: string[];
}
