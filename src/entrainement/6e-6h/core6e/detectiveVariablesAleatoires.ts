/**
 * Couche core — `6gen122` « Détective d'erreurs : variables aléatoires » (6e ch. 8, fin du chapitre,
 * processus 3 TRANSFÉRER). Même mécanique que 6gen109 / 6gen163 : un élève fictif a résolu un exercice
 * du chapitre en lignes numérotées ; UNE ligne est fausse et la suite en découle. Trois écrans : la
 * ligne fausse (choix fermé), l'erreur (4 descriptions, choix fermé), la correction (valeur juste,
 * trois tentatives).
 *
 * VARIANTE = TYPE D'ERREUR (groupe à verdict `groupe_erreur`) : moyenne non pondérée, σ = V², Φ(−z) =
 * Φ(z), « / 2 » de la règle empirique oublié, λ non ajusté, « au moins k » complété par P(X ≤ k),
 * (b − a)/12 pour la variance uniforme, Cₙᵏ oublié dans la loi binomiale, correction de continuité
 * oubliée. « Quelle ligne ? » est aussi un verdict : 0 à 3 lignes justes (préliminaires) précèdent la
 * ligne fausse, tiré EN DERNIER (`d.av`), jamais dans `forme`.
 */

export type VarianteDVA = "moyenne" | "ecartType" | "symetriePhi" | "regleUnCote" | "lambda" | "complement" | "uniforme" | "coefficient" | "continuite";

export const VARIANTES_DVA: VarianteDVA[] = ["moyenne", "ecartType", "symetriePhi", "regleUnCote", "lambda", "complement", "uniforme", "coefficient", "continuite"];

export interface ExerciceDVA {
  variante: VarianteDVA;
  /** Paramètres entiers du scénario (`av` = lignes justes avant la ligne fausse, 0 à 3). */
  d: Record<string, number>;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage. */
  options: string[];
}

/** Nature de la valeur corrigée : exacte (fraction, décimal exact), quatre décimales, pourcentage,
 * au centième. */
export type PrecisionDVA = "exacte" | "dec4" | "pourcent" | "centieme";
