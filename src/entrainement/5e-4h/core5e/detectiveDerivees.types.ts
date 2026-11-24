/**
 * Couche core — `5gen72` « Détective d'erreurs : dérivées » (5e ch. 5, §§ 2, 3, 5, processus 3
 * TRANSFÉRER). Même mécanique que 5gen67 / 5gen58 / 6gen144 : un élève fictif a résolu un exercice
 * du chapitre en lignes numérotées ; UNE ligne est fausse et la suite en découle. Trois écrans : la
 * ligne fausse (choix fermé), l'erreur (4 descriptions, choix fermé), la correction (champ(s) libre(s)).
 *
 * VARIANTE = TYPE D'ERREUR (le nom de la variante donne la réponse de l'écran 2 : groupes à verdict
 * `groupe_erreur_tangente` et `groupe_erreur_signe`). Deux familles d'exercices :
 * - TANGENTE (« détermine une équation de la tangente au point d'abscisse a ») : produit
 *   (uv)′ = u′v′, quotient (numérateur inversé), chaîne (dérivée de l'intérieur oubliée), inverse
 *   ((1/x)′ = 1/x², signe oublié), formuleTangente (y = f′(a)x + f(a), « − a » oublié) ;
 * - SIGNE (« détermine les extremums locaux de f ») : signeTrinome (signe du trinôme f′ inversé),
 *   racineOubliee (x² = k² ⇒ x = k seulement), sansChangement (zéro double de f′ compté comme
 *   extremum).
 * « Quelle ligne ? » est aussi un verdict : 0 à 3 lignes justes (préliminaires puis début de la
 * copie) précèdent la ligne fausse, tiré 1/4 chacun (`av`) — jamais dans `forme`.
 */

export type VarianteDetectiveDerivees =
  | "produit"
  | "quotient"
  | "chaine"
  | "inverse"
  | "formuleTangente"
  | "signeTrinome"
  | "racineOubliee"
  | "sansChangement";

export const VARIANTES_TANGENTE: VarianteDetectiveDerivees[] = ["produit", "quotient", "chaine", "inverse", "formuleTangente"];
export const VARIANTES_SIGNE: VarianteDetectiveDerivees[] = ["signeTrinome", "racineOubliee", "sansChangement"];

export interface ExerciceDetectiveDerivees {
  variante: VarianteDetectiveDerivees;
  /** Paramètres entiers du scénario, dont `av` (lignes justes avant la ligne fausse, 0 à 3). */
  d: Record<string, number>;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (le `?code=` rouvre le même ordre). */
  options: string[];
}

export const estFamilleTangente = (e: ExerciceDetectiveDerivees): boolean => VARIANTES_TANGENTE.includes(e.variante);
