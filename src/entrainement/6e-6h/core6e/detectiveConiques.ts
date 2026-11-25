/**
 * Couche core — `6gen143` « Détective d'erreurs : coniques » (6e ch. 10, fin du chapitre, processus 3
 * TRANSFÉRER). Même mécanique que 6gen99 / 6gen131 : un élève fictif a résolu un exercice du chapitre en
 * lignes numérotées ; UNE ligne est fausse et la suite en découle. Trois écrans : la ligne fausse (choix
 * fermé), l'erreur (4 descriptions, choix fermé), la correction (champ, trois tentatives : points, nombre
 * exact ou équation selon l'exercice).
 *
 * VARIANTE = TYPE D'ERREUR (groupe à verdict `groupe_erreur`) : c² = a² − b² appliqué à une hyperbole,
 * division par un second membre négatif sans changer les signes, foyer de la parabole à p au lieu de p/2,
 * Δ = 0 lu « aucun point », demi-conique prise pour une conique entière, mauvaise branche (signe de la
 * pente), « l'ellipse renvoie parallèlement à l'axe » (propriété de la parabole), excentricité e ≥ 1 pour
 * une ellipse. « Quelle ligne ? » est aussi un verdict : 0 à 3 lignes justes précèdent la ligne fausse,
 * tiré EN DERNIER (`d.av`), jamais dans `forme`.
 */

export type VarianteDC = "hyperboleC" | "secondMembre" | "p2p" | "deltaNul" | "demiConique" | "brancheSigne" | "ellipseParallele" | "excentricite";

export const VARIANTES_DC: VarianteDC[] = ["hyperboleC", "secondMembre", "p2p", "deltaNul", "demiConique", "brancheSigne", "ellipseParallele", "excentricite"];

export type PhaseDC = "ligne" | "erreur" | "correction";
export const PHASES_DC: PhaseDC[] = ["ligne", "erreur", "correction"];

export interface ExerciceDC {
  variante: VarianteDC;
  /** Paramètres du scénario (`av` = lignes justes avant la ligne fausse, 0 à 3). */
  d: Record<string, number>;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage. */
  options: string[];
}

export type TypeCorrectionDC = "points" | "nombre" | "equation";
