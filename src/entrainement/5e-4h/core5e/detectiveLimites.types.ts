/**
 * Couche core — `5gen67` « Détective d'erreurs : limites » (5e ch. 4, §§ 1–5, processus 3
 * TRANSFÉRER). Même mécanique que 5gen58 / 6gen144 / 6gen152 : un élève fictif a résolu un exercice
 * du chapitre en lignes numérotées ; UNE ligne est fausse et la suite en découle. Trois écrans : la
 * ligne fausse (choix fermé), l'erreur (4 descriptions, choix fermé), la correction (champ libre).
 *
 * VARIANTE = TYPE D'ERREUR (le nom de la variante donne la réponse de l'écran 2 : groupe à verdict
 * `groupe_erreur`). Erreurs signalées par le cours :
 * - infSurInf : « ∞/∞ = 1 » ; infMoinsInf : « ∞ − ∞ = 0 » ;
 * - signeZero : signe de 0⁺ / 0⁻ faux au dénominateur ;
 * - simplification : x² « barré » dans une somme (simplification illicite) ;
 * - racineMoinsInfini : √(x²) = x en −∞ ;
 * - degres : x²/x³ = x (degrés mal comparés) ;
 * - aoAh : asymptote oblique confondue avec une horizontale ;
 * - lateral : une seule limite latérale calculée (la limite en p n'existe pas).
 * « Quelle ligne ? » est aussi un verdict : 0 à 3 lignes justes (préliminaires puis début de la
 * copie) précèdent la ligne fausse, tiré 1/4 chacun (`av`) — jamais dans `forme`.
 */

export type VarianteDetectiveLimites = "infSurInf" | "infMoinsInf" | "signeZero" | "simplification" | "racineMoinsInfini" | "degres" | "aoAh" | "lateral";

export interface ExerciceDetectiveLimites {
  variante: VarianteDetectiveLimites;
  /** Paramètres entiers du scénario, dont `av` (lignes justes avant la ligne fausse, 0 à 3). */
  d: Record<string, number>;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (le `?code=` rouvre le même ordre). */
  options: string[];
}
